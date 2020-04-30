const { getParser } = require('codemod-cli').jscodeshift;

module.exports = function transformer(file, api) {
  const j = getParser(api);
  let root = j(file.source);

  let objName = '';
  function isObjPropRead(node) {
    return (
      node.id.type === 'Identifier' &&
      node.init &&
      node.init.property &&
      node.init.property.type === 'Identifier'
    );
  }
  function objConstruction(node1) {
    let node = node1 || {};
    let nodeName = node.type === 'ThisExpression' ? 'this' : node.name || node.property.name;
    objName = objName ? `${objName}.${nodeName}` : nodeName;
    if (node.object) {
      objConstruction(node.object);
    }
    let arr = objName.split('.').reverse();
    arr.pop();
    return arr.join('.');
  }
  root
    .find(j.VariableDeclarator)
    .filter((p) => p.value && isObjPropRead(p.value))
    .forEach((instance) => {
      objName = '';
      const readablePropName = instance.get('id').node.name;
      const neededPropName = instance.get('init').node.property.name;
      j(instance).replaceWith(
        j.variableDeclarator(
          j.identifier(
            readablePropName === neededPropName
              ? `{ ${readablePropName} }`
              : `{ ${neededPropName}: ${readablePropName} }`
          ),
          j.identifier(objConstruction(instance.value.init))
        )
      );
    });

  return root.toSource();
};
