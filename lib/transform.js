var __this = this;
var traverser = require('./traverser'), gen = require('./gen');
var insertLexicalThisTransformer = traverser({
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
var arrowTransformer = traverser({
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
function makeLiteral(value, raw) {
    var __this = this;
    return {
        'type': 'Literal',
        'value': value,
        'raw': raw
    };
}
function makeDefaultQuasi(literals, exprs) {
    var __this = this;
    var elems = [], i = 0;
    while (i < literals.length - 1) {
        elems.push(makeLiteral(literals[i].value.cooked, literals[i].value.raw));
        elems.push(exprs[i++]);
    }
    elems.push(makeLiteral(literals[i].value.cooked, literals[i].value.raw));
    return {
        'type': 'CallExpression',
        'callee': {
            'type': 'MemberExpression',
            'computed': false,
            'object': {
                'type': 'ArrayExpression',
                'elements': elems
            },
            'property': {
                'type': 'Identifier',
                'name': 'join'
            }
        },
        'arguments': [{
                'type': 'Literal',
                'value': '',
                'raw': '\'\''
            }]
    };
}
var quasiTransformer = traverser({
        quasiLiteral: function (q, context) {
            return makeDefaultQuasi(q.quasis, q.expressions.map(function (e) {
                return quasiTransformer.expr(e);
            }));
        }
    });
var arrayDestructuringTransformer = traverser({
        decl: function (d, context) {
            var __this = this;
            d = this.super.decl(d, context);
            if (d.id.type != 'ArrayPattern') {
                return d;
            }
            var temp = {
                    'type': 'Identifier',
                    'name': '__destructure'
                };
            return [gen.decl(temp, d.init)].concat(d.id.elements.map(function (e, i) {
                return __this.decl(gen.decl(e, gen.member(temp, i, { computed: true })));
            }));
        }
    });
var letTransformer = traverser({
        varDecl: function (d, context) {
            var __this = this;
            d = this.super.varDecl(d, context);
            if (d.kind == 'let') {
                d.kind = 'var';
                context.blocks[0].node.requiresBlockScope = true;
            }
            return d;
        },
        forInStmt: function (stmt, context) {
            var __this = this;
            if (stmt.left.type == 'VariableDeclaration' && stmt.left.kind == 'let') {
                var body = stmt.body;
                if (body.type !== 'BlockStatement') {
                    body = stmt.body = gen.block([body]);
                }
                return this.stmt(gen.forEachKey(stmt.right, body.body, stmt.left.declarations[0].id), context);
            }
            return this.super.forInStmt(stmt, context);
        },
        block: function (b, context) {
            var __this = this;
            var block = this.super.block(b, context);
            if (b.requiresBlockScope) {
                b.body = [{
                        'type': 'ExpressionStatement',
                        'expression': gen.closure(b.body, b.blockScopeParams)
                    }];
            }
            return b;
        }
    });
var comprehensionTransformer = traverser({
        comprehension: function (c, context) {
            var __this = this;
            var body = gen.block([{
                        'type': 'ExpressionStatement',
                        'expression': gen.call(gen.member('__comp', 'push'), [c.body])
                    }]);
            if (c.filter) {
                body = gen.block([{
                        'type': 'IfStatement',
                        'test': c.filter,
                        'consequent': body
                    }]);
            }
            c.blocks.reverse().forEach(function (b) {
                if (b.type == 'ComprehensionBlock') {
                    body = gen.block([{
                            'type': 'ForInStatement',
                            'left': {
                                'type': 'VariableDeclaration',
                                'declarations': [{
                                        'type': 'VariableDeclarator',
                                        'id': b.left,
                                        'init': null
                                    }],
                                'kind': 'var'
                            },
                            'right': b.right,
                            'body': body,
                            'each': false
                        }]);
                } else {
                    body.body.unshift(gen.varDecl(b.left, b.right));
                }
            });
            return this.expr(gen.closure([gen.varDecl('__comp', {
                    'type': 'ArrayExpression',
                    'elements': []
                })].concat(body.body).concat([{
                    'type': 'ReturnStatement',
                    'argument': gen.ident('__comp')
                }])), context);
        }
    });
var forFilterTransformer = traverser({
        forInStmt: function (stmt, context) {
            var __this = this;
            if (stmt.filter) {
                stmt.body = gen.block([{
                        'type': 'IfStatement',
                        'test': stmt.filter,
                        'consequent': stmt.body
                    }]);
                stmt.filter = null;
            }
            return this.super.forInStmt(stmt, context);
        }
    });
var monadTransformer = traverser({
        monad: function (m, context) {
            var __this = this;
            m = this.super.monad(m, context);
            var stmts = m.body.type == 'BlockStatement' ? m.body.body.reverse() : [m.body];
            var body = stmts[0], nextBody = [];
            if (body.type == 'ExpressionStatement') {
                body = gen.ret(body.expression);
            }
            stmts.slice(1).forEach(function (s) {
                if (s.type == 'VariableDeclaration') {
                    s.declarations.forEach(function (d) {
                        body = gen.ret(gen.call('__b', [
                            d.init,
                            gen.arrow([d.id], nextBody.length == 0 && body.type.indexOf('Expression') > 0 ? body : gen.block(nextBody.reverse().concat([body])))
                        ]));
                        nextBody = [];
                    });
                } else {
                    nextBody.push(s);
                }
            });
            return gen.closure([
                MONAD_BIND,
                body.type.indexOf('Expression') > 0 ? gen.ret(body) : body
            ]);
        }
    });
var MONAD_BIND = gen.varDecl('__b', {
        'type': 'ArrowFunctionExpression',
        'id': null,
        'params': [
            {
                'type': 'Identifier',
                'name': 'v'
            },
            {
                'type': 'Identifier',
                'name': 'n'
            }
        ],
        'defaults': [],
        'body': {
            'type': 'ConditionalExpression',
            'test': {
                'type': 'BinaryExpression',
                'operator': '==',
                'left': {
                    'type': 'UnaryExpression',
                    'operator': 'typeof',
                    'argument': gen.member('v', 'then')
                },
                'right': gen.val('function')
            },
            'consequent': gen.call(gen.member('v', 'then'), ['n']),
            'alternate': gen.call('n', ['v'])
        },
        'rest': null,
        'generator': false,
        'expression': true
    });
var LEXICAL_THIS = '__this', SET_LEXICAL_THIS = {
        'type': 'VariableDeclaration',
        'declarations': [gen.decl(LEXICAL_THIS, { 'type': 'ThisExpression' })],
        'kind': 'var'
    };
var transformers = [
        quasiTransformer,
        monadTransformer,
        comprehensionTransformer,
        arrowTransformer,
        arrayDestructuringTransformer,
        forFilterTransformer,
        letTransformer,
        insertLexicalThisTransformer
    ];
module.exports = function (ast) {
    var __this = this;
    ast = transformers.reduce(function (ast, t) {
        return t.traverse(ast);
    }, ast);
    return ast;
};