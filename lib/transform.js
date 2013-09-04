var __this = this;
var traverser = require('./traverser'), gen = require('./gen');
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
        arrowFuncExpr: function (fn, context) {
            return arrowTransformer.funcExpr({
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
            }, context);
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
var LEXICAL_THIS = '__this', SET_LEXICAL_THIS = {
        'type': 'VariableDeclaration',
        'declarations': [gen.decl(LEXICAL_THIS, { 'type': 'ThisExpression' })],
        'kind': 'var'
    };
var transformers = [
        quasiTransformer,
        arrowTransformer,
        arrayDestructuringTransformer,
        letTransformer,
        insertLexicalThisTransformer
    ];
module.exports = function (ast) {
    var __this = this;
    ast = transformers.reduce(function (ast, t) {
        return t.traverse(ast);
    }, ast);
    ast.body.splice(0, 0, SET_LEXICAL_THIS);
    return ast;
};