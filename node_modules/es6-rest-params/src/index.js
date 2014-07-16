var recast = require('recast');
var types = recast.types;
var n = recast.types.namedTypes;
var b = recast.types.builders;

function nodeVisitor(node) {
  if ( (n.FunctionExpression.check(node) ||
        n.FunctionDeclaration.check(node) ||
        n.ArrowFunctionExpression.check(node) ) && node.rest) {
    var numArgs = node.params.length;

    node.body.body.unshift(
      // var args = [].call(arguments, 1);
      b.variableDeclaration('var', [
        b.variableDeclarator(
          node.rest,
          b.callExpression(
            b.memberExpression(
              b.memberExpression(
                b.arrayExpression([]),
                b.identifier('slice'),
                false
              ),
              b.identifier('call'),
              false
            ),
            [b.identifier('arguments'), b.literal(numArgs)]
          )
        )
      ])
    );

    delete node.rest;
  }
}

function transform(ast) {
  return types.traverse(ast, nodeVisitor);
}

/**
 * @param {string} source
 * @param {Object} recastOptions
 * @return {string}
 */

function compile(source, customOptions) {
  customOptions = customOptions || {};
  var recastOptions = {
  };

  for ( var key in customOptions ) {
    recastOptions[key] = customOptions[key];
  }

  var ast = recast.parse(source, recastOptions);
  return recast.print(transform(ast), recastOptions);
}

module.exports = {
  compile: compile,
  transform: transform
};
