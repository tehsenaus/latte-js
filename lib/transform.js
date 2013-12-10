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
var forFilterTransformer = traverser({
        forInStmt: function (stmt, context) {
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
var flatten = Array.apply.bind([].concat, []);
var cleanupTransformer = traverser({
        stmts: function (stmts, context) {
            stmts = stmts.filter(function (s) {
                return s.type != 'EmptyStatement';
            });
            stmts = flatten(stmts.map(function (s) {
                return s.type == 'BlockStatement' ? s.body : s;
            }));
            return this.super.stmts(stmts, context);
        },
        blockStmts: function (stmts, context) {
            stmts = stmts.filter(function (s) {
                return s.type != 'EmptyStatement';
            });
            stmts = flatten(stmts.map(function (s) {
                return s.type == 'BlockStatement' ? s.body : s;
            }));
            return this.super.blockStmts(stmts, context);
        },
        callExpr: function (expr, context) {
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
        require('./transformer/arrowFunc'),
        require('./transformer/generator'),
        require('./transformer/comprehension'),
        require('./transformer/forOf'),
        require('./transformer/arrowFunc'),
        arrayDestructuringTransformer,
        forFilterTransformer,
        require('./transformer/let'),
        cleanupTransformer,
        cleanupTransformer,
        require('./transformer/arrowFunc').insertLexicalThisTransformer,
        require('./transformer/insertPrelude')
    ];
module.exports = function (ast) {
    ast = transformers.reduce(function (ast, t) {
        return t.traverse(ast);
    }, ast);
    return ast;
};