var __this = this;
var traverser = require('../traverser'), gen = require('../gen');
var monadTransformer = module.exports = traverser.explicit('monad', {
        _bind: function (expr, context) {
            var __this = this;
            context.stmt.hasBinds = true;
            var oldIsInBind = context.isInBind;
            context.isInBind = true;
            var bound = context.monad.bind(this.expr(expr, context));
            context.isInBind = oldIsInBind;
            return bound;
        },
        traverse: function (ast) {
            var __this = this;
            ast = this.super.traverse(ast);
            if (ast.hasMonads) {
                ast['requires monad-bind prelude'] = true;
            }
            return ast;
        },
        ifStmt: function (stmt, context) {
            var __this = this;
            var aHasBinds = stmtHasBinds(stmt.consequent);
            bHasBinds = stmt.alternate && stmtHasBinds(stmt.alternate);
            if (aHasBinds || bHasBinds) {
                var c = {
                        type: 'ExpressionStatement',
                        expression: genBind(gen.conditional(stmt.test, genMonad(stmt.consequent), stmt.alternate ? genMonad(stmt.alternate) : gen.val(true)))
                    };
                c = this.stmt(c, context);
                return c;
            }
            var oldMonad = context.monad;
            context.monad = null;
            stmt = this.super.ifStmt(stmt, context);
            context.monad = oldMonad;
            return stmt;
        },
        forInOfStmt: function (stmt, context) {
            var __this = this;
            if (!stmt.monadic && stmtHasBinds(stmt.body)) {
                var monad = genMonad(stmt.body);
                var bodyClosure = gen.arrow([], monad);
                var chain = gen.ident(context.temp());
                stmt.left.kind = 'let';
                stmt.body = gen.assignStmt(chain, gen.call(MONAD_BIND, [
                    chain,
                    bodyClosure
                ]));
                stmt.monadic = true;
                return gen.block(this.stmts([
                    gen.varDecl(chain, null),
                    stmt,
                    gen.exprStmt(genBind(chain))
                ], context));
            }
            var oldMonad = context.monad;
            context.monad = null;
            stmt = this.super.forInOfStmt(stmt, context);
            context.monad = oldMonad;
            return stmt;
        },
        forStmt: function (stmt, context) {
            var __this = this;
            if (!stmt.monadic && stmtHasBinds(stmt.body)) {
                throw new Error('Monadic binds not supported in for statement... yet!');
                var monad = genMonad(stmt.body);
                var bodyClosure = gen.arrow([], monad);
                var rec = context.temp();
                stmt = gen.call(gen.fn([gen.ret(gen.conditional(stmt.test, gen.call(MONAD_BIND, [
                        bodyClosure,
                        rec
                    ]), gen.ident('null')))]));
                stmt.monadic = true;
                return gen.block(this.stmts([gen.exprStmt(genBind(stmt))], context));
            }
            var oldMonad = context.monad;
            context.monad = null;
            stmt = this.super.whileDoWhileStmt(stmt, context);
            context.monad = oldMonad;
            return stmt;
        },
        whileDoWhileStmt: function (stmt, context) {
            var __this = this;
            if (!stmt.monadic && stmtHasBinds(stmt.body)) {
                var monad = genMonad(stmt.body);
                var rec = context.temp();
                stmt = gen.closure([gen.ret(genMonadExpr(gen.conditional(stmt.test, gen.call(MONAD_BIND, [
                        monad,
                        rec
                    ]), gen.ident('null'))))], [], rec);
                stmt.monadic = true;
                return gen.block(this.stmts([gen.exprStmt(genBind(stmt))], context));
            }
            var oldMonad = context.monad;
            context.monad = null;
            stmt = this.super.whileDoWhileStmt(stmt, context);
            context.monad = oldMonad;
            return stmt;
        },
        switchStmt: function (stmt, context) {
            var __this = this;
            if (!stmt.monadic && stmtHasBinds(stmt)) {
                throw new Error('Monadic binds not supported in switch statement... yet!');
            }
            var oldMonad = context.monad;
            context.monad = null;
            stmt = this.super.switchStmt(stmt, context);
            context.monad = oldMonad;
            return stmt;
        },
        tryStmt: function (stmt, context) {
            var __this = this;
            if (!stmt.monadic && stmtHasBinds(stmt)) {
                throw new Error('Monadic binds not supported in try statement... yet!');
            }
            var oldMonad = context.monad;
            context.monad = null;
            stmt = this.super.tryStmt(stmt, context);
            context.monad = oldMonad;
            return stmt;
        },
        func: function (stmt, context) {
            var __this = this;
            var oldMonad = context.monad;
            context.monad = null;
            stmt = this.super.func(stmt, context);
            context.monad = oldMonad;
            return stmt;
        },
        unary: function (expr, context) {
            var __this = this;
            if (expr.operator === '<<') {
                if (!context.monad) {
                    throw new Error('Unexpected "<<": not in monad block!');
                }
                return this._bind(expr.argument, context);
            }
            return this.super.unary(expr, context);
        },
        binary: function (expr, context) {
            var __this = this;
            if (!context.isInBind && expr.type === 'LogicalExpression') {
                var bHasBinds = exprHasBinds(expr.right);
                if (bHasBinds) {
                    expr.right = genMonadExpr(expr.right);
                    return this.expr(genBind(expr), context);
                }
            }
            return this.super.binary(expr, context);
        },
        conditional: function (expr, context) {
            var __this = this;
            if (!context.isInBind) {
                var aHasBinds = exprHasBinds(expr.consequent);
                bHasBinds = exprHasBinds(expr.alternate);
                if (aHasBinds || bHasBinds) {
                    if (aHasBinds)
                        expr.consequent = genMonadExpr(expr.consequent);
                    if (bHasBinds)
                        expr.alternate = genMonadExpr(expr.alternate);
                    return this.expr(genBind(expr), context);
                }
            }
            return this.super.conditional(expr, context);
        },
        stmt: function (stmt, context) {
            var __this = this;
            var oldStmt = context.stmt;
            context.stmt = {};
            stmt = this.super.stmt(stmt, context);
            if (context.monad) {
                if (stmt.type != 'BlockStatement') {
                    context.monad.stmt(stmt);
                    stmt = { 'type': 'EmptyStatement' };
                }
            }
            context.stmt = oldStmt;
            return stmt;
        },
        monad: function (m, context) {
            var __this = this;
            var lastMonad = context.monad;
            var binds = [], stmts = [];
            var monad = context.monad = {
                    bind: function (expr) {
                        var t = context.temp();
                        binds.push({
                            t: t,
                            expr: expr,
                            stmts: stmts
                        });
                        stmts = [];
                        return gen.ident(t);
                    },
                    stmt: function (stmt) {
                        return stmts.push(stmt);
                    }
                };
            m = this.super.monad(m, context);
            var body = binds.reduceRight(function (s, b) {
                    return gen.block(b.stmts.concat([gen.ret(gen.call(MONAD_BIND, [
                            b.expr,
                            gen.arrow([b.t], s)
                        ]))]));
                }, gen.block((m.body.body || []).concat(stmts)));
            context.monad = lastMonad;
            context.ast.hasMonads = true;
            return gen.closure([body.type.indexOf('Expression') > 0 ? gen.ret(body) : body]);
        }
    });
var hasBindsTraverser = traverser({
        exprHasBinds: function (expr) {
            var __this = this;
            var context = this.context();
            this.expr(expr, context);
            return context.hasBinds;
        },
        stmtHasBinds: function (stmt) {
            var __this = this;
            var context = this.context();
            this.stmt(stmt, context);
            return context.hasBinds;
        },
        unary: function (expr, context) {
            var __this = this;
            if (expr.operator === '<<') {
                context.hasBinds = true;
            }
            return this.super.unary(expr, context);
        },
        monad: function (m) {
            var __this = this;
            return m;
        }
    });
function exprHasBinds(expr) {
    var __this = this;
    return hasBindsTraverser.exprHasBinds(expr);
}
function stmtHasBinds(stmt) {
    var __this = this;
    return hasBindsTraverser.stmtHasBinds(stmt);
}
function genBind(expr) {
    var __this = this;
    return {
        type: 'UnaryExpression',
        operator: '<<',
        argument: expr
    };
}
function genMonad(stmts) {
    var __this = this;
    return {
        type: 'MonadExpression',
        body: gen.block(stmts)
    };
}
function genMonadExpr(expr) {
    var __this = this;
    return genMonad(gen.ret(expr));
}
var MONAD_BIND = '__when';