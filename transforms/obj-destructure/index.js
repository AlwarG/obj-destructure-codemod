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
      const variableName = instance.get('id').node.name;
      const propName = instance.get('init').node.property.name;
      j(instance).replaceWith(
        j.variableDeclarator(
          j.objectPattern([j.property('init', j.identifier(propName), j.identifier(variableName))]),
          j.identifier(objConstruction(instance.value.init))
        )
      );
    });
  root
    .find(j.VariableDeclarator)
    .filter((p) => p.value && p.value.id && p.value.id.type === 'ObjectPattern')
    .forEach((path) => {
      path.value.id.properties.forEach((prop) => {
        if (prop.value.type === 'Identifier') {
          prop.shorthand = prop.key.name === prop.value.name;
        }
      });
    });

  return root.toSource();
}