'use strict';

const { runTransformTest } = require('codemod-cli');

runTransformTest({
  type: 'jscodeshift',
  name: 'function-arg-obj-destructure',
});