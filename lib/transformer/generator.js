var __this = this;
var traverser = require('../traverser'), gen = require('../gen');
var generatorTransformer = module.exports = traverser.explicit('generator', {
        _yield: function (expr, context) {
            var __this = this;
            var oldIsInYield = context.isInYield;
            context.isInYield = true;
            var bound = context.generator.yield(this.expr(expr, context));
            context.isInYield = oldIsInYield;
            return bound;
        },
        traverse: function (ast) {
            var __this = this;
            ast = this.super.traverse(ast);
            if (ast.hasGenerators) {
                ast['requires generator prelude'] = true;
            }
            return ast;
        },
        ifStmt: function (stmt, context) {
            var __this = this;
            var aHasYields = stmtHasYields(stmt.consequent);
            bHasYields = stmt.alternate && stmtHasYields(stmt.alternate);
            if (aHasYields || bHasYields) {
                context.generator.withcc(function (cc) {
                    return gen.ifStmt(stmt.test, [
                        __this.stmt(stmt.consequent, context),
                        cc(gen.ident('null'))
                    ], [
                        stmt.alternate ? __this.stmt(stmt.alternate, context) : gen.empty,
                        cc(gen.ident('null'))
                    ]);
                });
                return gen.empty;
            }
            var oldGenerator = context.generator;
            context.generator = null;
            stmt = this.super.ifStmt(stmt, context);
            context.generator = oldGenerator;
            return stmt;
        },
        forInOfStmt: function (stmt, context) {
            var __this = this;
            if (!stmt.generatoric && stmtHasYields(stmt.body)) {
                throw new Error('Yields not supported in for statement... yet!');
            }
            var oldGenerator = context.generator;
            context.generator = null;
            stmt = this.super.forInOfStmt(stmt, context);
            context.generator = oldGenerator;
            return stmt;
        },
        forStmt: function (stmt, context) {
            var __this = this;
            if (!stmt.generatoric && stmtHasYields(stmt.body)) {
                throw new Error('Yields not supported in for statement... yet!');
            }
            var old = context.generator;
            context.generator = null;
            stmt = this.super.forStmt(stmt, context);
            context.generator = old;
            return stmt;
        },
        whileDoWhileStmt: function (stmt, context) {
            var __this = this;
            if (context.generator && stmtHasYields(stmt.body)) {
                var rec = context.temp();
                if (stmt.type == 'DoWhileStatement') {
                    stmt = gen.block(stmt.body).body.concat([gen.ifStmt(stmt.test, gen.ret(gen.call(rec)))]);
                } else {
                    stmt = [gen.ifStmt(stmt.test, gen.block(stmt.body).body.concat([gen.ret(gen.call(rec))]))];
                }
                stmt = gen.closure(stmt, [], rec);
                stmt.callee.generator = true;
                stmt.callee.internalGenerator = context.generator;
                return gen.block(this.stmts([gen.exprStmt(stmt)], context));
            }
            var oldMonad = context.monad;
            context.generator = null;
            stmt = this.super.whileDoWhileStmt(stmt, context);
            context.generator = oldMonad;
            return stmt;
        },
        switchStmt: function (stmt, context) {
            var __this = this;
            if (stmtHasYields(stmt)) {
                throw new Error('Yields not supported in switch statement... yet!');
            }
            var old = context.generator;
            context.generator = null;
            stmt = this.super.switchStmt(stmt, context);
            context.generator = old;
            return stmt;
        },
        tryStmt: function (stmt, context) {
            var __this = this;
            if (stmtHasYields(stmt)) {
                throw new Error('Yields not supported in try statement... yet!');
            }
            var old = context.generator;
            context.generator = null;
            stmt = this.super.tryStmt(stmt, context);
            context.generator = old;
            return stmt;
        },
        func: function (stmt, context) {
            var __this = this;
            var oldGenerator = context.generator;
            context.generator = null;
            stmt = this.super.func(stmt, context);
            context.generator = oldGenerator;
            return stmt;
        },
        yieldExpr: function (expr, context) {
            var __this = this;
            if (!context.generator) {
                throw new Error('Unexpected yield: not in generator!');
            }
            return this._yield(expr.argument, context);
        },
        binary: function (expr, context) {
            var __this = this;
            if (!context.isInYield && expr.type === 'LogicalExpression') {
                var bHasYields = exprHasYields(expr.right);
                if (bHasYields) {
                    var test = gen.ident(context.temp());
                    this.stmt(gen.varDecl(test, expr.left), context);
                    return context.generator.withcc(function (cc) {
                        return gen.ifStmt(expr.operator == '||' ? gen.not(test) : test, [cc(__this.expr(expr.right, context))], [cc(test)]);
                    });
                }
            }
            return this.super.binary(expr, context);
        },
        conditional: function (expr, context) {
            var __this = this;
            if (!context.isInYield) {
                var aHasYields = exprHasYields(expr.consequent);
                bHasYields = exprHasYields(expr.alternate);
                if (aHasYields || bHasYields) {
                    return context.generator.withcc(function (cc) {
                        return gen.ifStmt(expr.test, [cc(__this.expr(expr.consequent, context))], [cc(__this.expr(expr.alternate, context))]);
                    });
                }
            }
            return this.super.conditional(expr, context);
        },
        callExpr: function (expr, context) {
            var __this = this;
            if (expr.callee.generator && expr.callee.internalGenerator && expr.callee.body.body[0].type == 'ReturnStatement') {
                var m = expr.callee;
                return m.internalGenerator.withcc(function (cc) {
                    m.body = cc(expr.callee.body.body[0].argument);
                    expr = __this.super.callExpr(expr, context);
                    return gen.exprStmt(expr);
                });
            }
            return this.super.callExpr(expr, context);
        },
        stmt: function (stmt, context) {
            var __this = this;
            if (stmt.type == 'ExpressionStatement') {
                if (stmt.expression.type == 'YieldExpression') {
                    return this.super.stmt(stmt, context);
                }
                if (stmt.expression.type == 'CallExpression' && stmt.expression.callee.generator && stmt.expression.callee.internalGenerator) {
                    var m = stmt.expression.callee;
                    m.internalGenerator.withcc(function (cc) {
                        m.body.body.push(cc());
                        stmt.expression.callee = __this.expr(stmt.expression.callee, context);
                        return gen.ret(stmt.expression);
                    });
                    return gen.empty;
                }
            }
            stmt = this.super.stmt(stmt, context);
            if (context.generator) {
                if (stmt.type != 'BlockStatement') {
                    context.generator.stmt(stmt);
                    stmt = gen.empty;
                }
            }
            return stmt;
        },
        withGenerator: function (m, context, fn) {
            var __this = this;
            var lastGenerator = context.generator;
            var yields = [], stmts = [], continuations = [], body = [], topLevelBody = body;
            var generator = context.generator = {
                    withcc: function (fn) {
                        var pre = stmts, preYields = yields, cc = context.temp(), ccv = context.temp();
                        yields = [];
                        stmts = [];
                        stmt = fn(function (v) {
                            return generator.callc(cc, v);
                        });
                        yields = preYields;
                        stmts = pre;
                        generator.stmt(stmt);
                        var r = generator.callc(gen.block([]));
                        body.push(r);
                        var continuation = gen.fndecl([], [ccv], cc);
                        body = continuation.body.body;
                        stmts = [];
                        continuations.push(continuation);
                        return gen.ident(ccv);
                    },
                    callc: function (c, v) {
                        var r = c.type == 'BlockStatement' ? c : gen.call(c, v ? [v] : []);
                        if (stmts.length) {
                            if (r.type == 'CallExpression') {
                                r = gen.block([gen.ret(r)]);
                            }
                            r.body = stmts.concat(r.body);
                            stmts = [];
                        }
                        r = yields.reduceRight(function (s, y) {
                            return gen.block(y.stmts.concat([gen.ret(gen.call(YIELD, [
                                    y.expr,
                                    gen.arrow([
                                        y.e,
                                        y.t
                                    ], s)
                                ]))]));
                        }, r);
                        yields = [];
                        return r.type == 'CallExpression' ? gen.block([gen.ret(r)]) : r;
                    },
                    yield: function (expr) {
                        var e = 'e', t = context.temp();
                        yields.push({
                            e: e,
                            t: t,
                            expr: expr,
                            stmts: stmts
                        });
                        stmts = [];
                        cc = null;
                        return gen.ident(t);
                    },
                    stmt: function (stmt) {
                        return stmts.push(stmt);
                    }
                };
            m = fn();
            context.generator = lastGenerator;
            context.ast.hasGenerators = true;
            body.push(generator.callc(gen.block([])));
            return gen.block(topLevelBody.concat(continuations));
        },
        generator: function (m, context) {
            var __this = this;
            if (m.internalGenerator) {
                m.body = this.withGenerator(m, context, function () {
                    return __this.super.generator(m, context);
                });
            } else {
                m.body.body.push(gen.exprStmt(gen.call('__stop')));
                var body = this.withGenerator(m, context, function () {
                        return __this.super.generator(m, context);
                    });
                m.body.body = [gen.ret(gen.call('__gen', [gen.fn([body.type.indexOf('Expression') > 0 ? gen.ret(body) : body], [
                            '__yield',
                            '__stop'
                        ])]))];
            }
            m.generator = false;
            return m;
        }
    });
var hasYieldsTraverser = traverser({
        exprHasYields: function (expr) {
            var __this = this;
            var context = this.context();
            this.expr(expr, context);
            return context.hasYields;
        },
        stmtHasYields: function (stmt) {
            var __this = this;
            var context = this.context();
            this.stmt(stmt, context);
            return context.hasYields;
        },
        yieldExpr: function (e, context) {
            var __this = this;
            context.hasYields = true;
            return this.super.yieldExpr(e, context);
        },
        generator: function (g) {
            var __this = this;
            return g;
        }
    });
function exprHasYields(expr) {
    var __this = this;
    return hasYieldsTraverser.exprHasYields(expr);
}
function stmtHasYields(stmt) {
    var __this = this;
    return hasYieldsTraverser.stmtHasYields(stmt);
}
function genYield(expr) {
    var __this = this;
    return {
        type: 'YieldExpression',
        argument: expr
    };
}
function genGenerator(stmts) {
    var __this = this;
    return gen.call({
        type: 'FunctionExpression',
        params: [],
        defaults: [],
        body: gen.block(stmts),
        generator: true
    });
}
function genGeneratorExpr(expr, context) {
    var __this = this;
    var r = gen.closure([gen.ret(expr)]);
    r.callee.generator = true;
    r.callee.internalGenerator = context.generator;
    return r;
}
var YIELD = '__yield';
function dbg(v) {
    var __this = this;
    try {
        return require('escodegen').generate(v);
    } catch (e) {
        return v;
    }
}