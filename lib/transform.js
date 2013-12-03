var __this = this;
var traverser = require('./traverser'), gen = require('./gen');
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
var ITER = '__iter';
var ITER_FN = {
        'type': 'FunctionDeclaration',
        'id': gen.ident(ITER),
        'params': [
            {
                'type': 'Identifier',
                'name': 'v'
            },
            {
                'type': 'Identifier',
                'name': 'f'
            }
        ],
        'defaults': [],
        'body': {
            'type': 'BlockStatement',
            'body': [gen.exprStmt(gen.call(gen.member('v', 'forEach'), ['f']))]
        },
        'rest': null,
        'generator': false,
        'expression': false
    };
var insertIterTransformer = traverser({
        traverse: function (ast) {
            var __this = this;
            ast = this.super.traverse(ast);
            if (ast.requiresIter) {
                ast.body.unshift(ITER_FN);
            }
            return ast;
        }
    });
var forOfTransformer = traverser({
        forOfStmt: function (stmt, context) {
            var __this = this;
            context.ast.requiresIter = true;
            var left = stmt.left;
            if (stmt.left.type == 'VariableDeclaration') {
                if (stmt.left.declarations[0].id.type != 'Identifier') {
                    left = gen.ident(context.temp());
                    stmt.left.declarations[0].init = left;
                    stmt.body = gen.block(stmt.body);
                    stmt.body.body.unshift(stmt.left);
                } else {
                    left = stmt.left.declarations[0].id;
                }
            }
            return this.stmt(gen.exprStmt(gen.call(ITER, [
                stmt.right,
                gen.arrow([left], gen.block(stmt.body))
            ])), context);
        }
    });
var flatten = Array.apply.bind([].concat, []);
var cleanupTransformer = traverser({
        stmts: function (stmts, context) {
            var __this = this;
            stmts = stmts.filter(function (s) {
                return s.type != 'EmptyStatement';
            });
            stmts = flatten(stmts.map(function (s) {
                return s.type == 'BlockStatement' ? s.body : s;
            }));
            return this.super.stmts(stmts, context);
        },
        callExpr: function (expr, context) {
            var __this = this;
            if (expr.callee.type == 'FunctionExpression' && expr.arguments.length == 0 && expr.callee.id == null) {
                if (expr.callee.body.body.length == 0) {
                } else if (expr.callee.body.body[0].type == 'ReturnStatement') {
                    return this.expr(expr.callee.body.body[0].argument, context);
                }
            }
            return this.super.callExpr(expr, context);
        }
    });
var transformers = [
        require('./transformer/quasi'),
        require('./transformer/monad'),
        require('./transformer/generator'),
        comprehensionTransformer,
        forOfTransformer,
        require('./transformer/arrowFunc'),
        arrayDestructuringTransformer,
        forFilterTransformer,
        insertIterTransformer,
        letTransformer,
        cleanupTransformer,
        cleanupTransformer,
        require('./transformer/arrowFunc').insertLexicalThisTransformer,
        require('./transformer/insertPrelude')
    ];
module.exports = function (ast) {
    var __this = this;
    ast = transformers.reduce(function (ast, t) {
        return t.traverse(ast);
    }, ast);
    return ast;
};