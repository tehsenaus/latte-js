var __this = this;
var traverser = require('../traverser'), gen = require('../gen');
var arrowTransformer = module.exports = traverser({
        arrowFuncExpr: function (fn, context) {
            replaceThisTransformer.replacedThis = false;
            fn = {
                'type': 'FunctionExpression',
                'id': null,
                'params': fn.params,
                'defaults': [],
                'body': fn.body.type == 'BlockStatement' ? replaceThisTransformer.stmt(fn.body, context) : {
                    'type': 'BlockStatement',
                    'body': [{
                            'type': 'ReturnStatement',
                            'argument': replaceThisTransformer.expr(fn.body, context)
                        }]
                },
                'rest': null,
                'generator': false,
                'expression': false,
                noScope: true
            };
            if (replaceThisTransformer.replacedThis) {
                context.scopes[0].node.requiresLexicalThis = true;
            }
            return arrowTransformer.funcExpr(fn, context);
        }
    });
var replaceThisTransformer = traverser({
        func: function (fn) {
            return fn;
        },
        thisExpr: function (ident, context) {
            var __this = this;
            this.replacedThis = true;
            return {
                type: 'Identifier',
                name: context && context.lexicalThis || LEXICAL_THIS
            };
        }
    });
var insertLexicalThisTransformer = arrowTransformer.insertLexicalThisTransformer = traverser({
        traverse: function (ast) {
            var __this = this;
            ast = this.super.traverse(ast);
            if (ast.requiresLexicalThis) {
                ast.body.splice(0, 0, SET_LEXICAL_THIS);
            }
            return ast;
        },
        func: function (fn, context) {
            if (!fn.noScope && fn.requiresLexicalThis) {
                fn.body.body.splice(0, 0, SET_LEXICAL_THIS);
            }
            return insertLexicalThisTransformer.super.func(fn, context);
        }
    });
var LEXICAL_THIS = '__this', SET_LEXICAL_THIS = {
        'type': 'VariableDeclaration',
        'declarations': [gen.decl(LEXICAL_THIS, { 'type': 'ThisExpression' })],
        'kind': 'var'
    };