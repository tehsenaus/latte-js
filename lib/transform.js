var __this = this;
var traverser = require('./traverser');
var insertLexicalThisTransformer = traverser({
        func: function (fn, context) {
            if (!fn.noScope)
                fn.body.body.splice(0, 0, SET_LEXICAL_THIS);
            return insertLexicalThisTransformer.super.func(fn, context);
        }
    });
var replaceThisTransformer = traverser({
        func: function (fn) {
            return fn;
        },
        thisExpr: function (ident, context) {
            return {
                type: 'Identifier',
                name: context && context.lexicalThis || LEXICAL_THIS
            };
        }
    });
var arrowTransformer = traverser({
        arrowFuncExpr: function (fn) {
            return arrowTransformer.funcExpr({
                'type': 'FunctionExpression',
                'id': null,
                'params': fn.params,
                'defaults': [],
                'body': fn.body.type == 'BlockStatement' ? replaceThisTransformer.stmt(fn.body) : {
                    'type': 'BlockStatement',
                    'body': [{
                            'type': 'ReturnStatement',
                            'argument': replaceThisTransformer.expr(fn.body)
                        }]
                },
                'rest': null,
                'generator': false,
                'expression': false,
                noScope: true
            });
        }
    });
var LEXICAL_THIS = '__this', SET_LEXICAL_THIS = {
        'type': 'VariableDeclaration',
        'declarations': [{
                'type': 'VariableDeclarator',
                'id': {
                    'type': 'Identifier',
                    'name': LEXICAL_THIS
                },
                'init': { 'type': 'ThisExpression' }
            }],
        'kind': 'var'
    };
module.exports = function (ast) {
    var __this = this;
    ast = arrowTransformer.traverse(ast);
    ast = insertLexicalThisTransformer.traverse(ast);
    ast.body.splice(0, 0, SET_LEXICAL_THIS);
    return ast;
};