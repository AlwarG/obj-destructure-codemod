const { getParser } = require('codemod-cli').jscodeshift;

module.exports = function transformer(file, api) {
  const j = getParser(api);
  let root = j(file.source);
  function changeProps(node) {
    let { properties } = node;
    let shorthandProps = [...properties].filter(({ shorthand }) => shorthand);
    let longhandProps = [...properties].filter(({ shorthand }) => !shorthand);
    node.properties = [...shorthandProps, ...longhandProps];
  }

  root.find(j.ObjectExpression).forEach(({ value }) => changeProps(value));
  root.find(j.ObjectPattern).forEach(({ value }) => changeProps(value));

  return root.toSource();
};
