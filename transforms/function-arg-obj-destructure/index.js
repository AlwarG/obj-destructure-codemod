const { getParser } = require('codemod-cli').jscodeshift;

module.exports = function transformer(file, api) {
  const j = getParser(api);
  let root = j(file.source);
  let allowablePropertiesLen = 1;
  root
    .find(j.FunctionExpression)
    .filter((p) => p.value && p.value.params.length)
    .forEach((path) => changeObjRead(path));
  root
    .find(j.ArrowFunctionExpression)
    .filter((p) => p.value && p.value.params.length)
    .forEach((path) => changeObjRead(path));
  root
    .find(j.FunctionDeclaration)
    .filter((p) => p.value && p.value.params.length)
    .forEach((path) => changeObjRead(path));

  function changeObjRead(path) {
    let funArgs = path.value.params.map((path) => {
      if (path.type === 'Identifier') {
        return path.name;
      } else if (
        path.type === 'AssignmentPattern' &&
        path.right.type === 'ObjectExpression' &&
        !path.right.properties.length
      ) {
        return path.left.name;
      }
    });
    let memberExps = j(path.value.body).find(j.MemberExpression).__paths;

    function isArgObj(node) {
      if (node.type === 'Identifier') {
        return funArgs.includes(node.name);
      } else if (node.type === 'CallExpression') {
        return false;
      }
      return isArgObj(node.object);
    }

    function isObjExp({ value, parentPath }) {
      if (value.computed) {
        return (
          value.property.type === 'Literal' &&
          parentPath.value.type !== 'AssignmentExpression' &&
          parentPath.value.type !== 'CallExpression' &&
          value.type === 'MemberExpression' &&
          isArgObj(value)
        );
      }
      return (
        parentPath.value.type !== 'AssignmentExpression' &&
        parentPath.value.type !== 'CallExpression' &&
        value.type === 'MemberExpression' &&
        isArgObj(value)
      );
    }

    if (memberExps && memberExps.length) {
      let objExps = memberExps.filter((node) => isObjExp(node));
      if (objExps && objExps.length) {
        for (let i = 1; i < objExps.length; i++) {
          let { start: currentStart, end: currentEnd } = objExps[i].value;
          for (let j = i - 1; j > -1; j--) {
            let { start, end } = objExps[j].value;
            if (start >= currentStart && end <= currentEnd) {
              objExps.splice(j, 1);
              break;
            } else if (start <= currentStart && end >= currentEnd) {
              objExps.splice(i, 1);
              i = 1;
              break;
            }
          }
        }
        let singlePropObjExps = objExps.filter(({ value }) => !value.object.object);
        if (singlePropObjExps.length === objExps.length) {
          let objPropsMap = [];
          objExps.forEach(({ value }, index) => {
            let isPropAlreadyPresent = false;
            let name = value.property.value || value.property.name;
            for (let i = 0; i < objPropsMap.length; i++) {
              if (objPropsMap[i].obj === value.object.name) {
                objPropsMap[i].props.push({
                  name,
                  position: index,
                });
                isPropAlreadyPresent = true;
                break;
              }
            }
            if (!isPropAlreadyPresent) {
              objPropsMap.push({
                obj: value.object.name,
                props: [
                  {
                    name,
                    position: index,
                  },
                ],
              });
            }
          });
          objPropsMap.forEach((objProps) => {
            let objPropsArr = [...new Set(objProps.props.map(({ name }) => name))];
            let identifierNodes = j(path.value.body)
              .find(j.Identifier)
              .filter((p) => p.value.name === objProps.obj);
            if (
              objPropsArr.length === identifierNodes.length &&
              objPropsArr.length <= allowablePropertiesLen
            ) {

              let isEmptyObjAssign = false;
              let paramIndex = path.value.params.findIndex((param) => {
                if (
                  param.type === 'AssignmentPattern' &&
                  param.right.type === 'ObjectExpression' &&
                  !param.right.properties.length
                ) {
                  isEmptyObjAssign = true;
                  return param.left.name === objProps.obj;
                }
                return param.name === objProps.obj;
              });
              if (isEmptyObjAssign) {
                path.value.params[paramIndex].left.name = `{ ${objPropsArr.join(', ')} }`;
              } else {
                path.value.params[paramIndex].name = `{ ${objPropsArr.join(', ')} }`;
              }
              objProps.props.forEach((prop) => {
                let node = singlePropObjExps[prop.position];
                let name = node.value.property.value || node.value.property.name;
                j(node).replaceWith(j.identifier(name));
              });
            }
          });
        }
      }
    }
  }
  return root.toSource();
}