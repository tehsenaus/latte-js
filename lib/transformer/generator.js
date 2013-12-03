var __this = this;
var traverser = require('../traverser'), gen = require('../gen');
var generatorTransformer = module.exports = traverser.explicit('generator', {
        _yield: function (expr, context) {
            var __this = this;
            context.stmt.hasYields = true;
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
                var generator = genGenerator(stmt.body);
                var bodyClosure = gen.arrow([], generator);
                var chain = gen.ident(context.temp());
                stmt.left.kind = 'let';
                stmt.body = gen.assignStmt(chain, gen.call(YIELD, [
                    chain,
                    bodyClosure
                ]));
                stmt.generatoric = true;
                return gen.block(this.stmts([
                    gen.varDecl(chain, null),
                    stmt,
                    gen.exprStmt(genYield(chain))
                ], context));
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
                var monad = genMonad(stmt.body);
                var bodyClosure = gen.arrow([], monad);
                var rec = context.temp();
                stmt = gen.call(gen.fn([gen.ret(gen.conditional(stmt.test, gen.call(YIELD, [
                        bodyClosure,
                        rec
                    ]), gen.ident('null')))]));
                stmt.generatoric = true;
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
            if (!stmt.generatoric && stmtHasYields(stmt.body)) {
                var rec = context.temp();
                stmt = gen.closure([gen.ifStmt(stmt.test, gen.block(stmt.body).body.concat([gen.ret(gen.call(rec))]))], [], rec);
                stmt.callee.generatoric = true;
                return gen.block(this.stmts([gen.exprStmt(stmt)], context));
            }
            var oldMonad = context.monad;
            context.monad = null;
            stmt = this.super.whileDoWhileStmt(stmt, context);
            context.monad = oldMonad;
            return stmt;
        },
        func: function (stmt, context) {
            var __this = this;
            var oldGenerator = context.generator;
            if (!stmt.generatoric)
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
                    expr.right = genGeneratorExpr(expr.right);
                    return this.expr(genYield(expr), context);
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
        stmt: function (stmt, context) {
            var __this = this;
            var oldStmt = context.stmt;
            context.stmt = {};
            stmt = this.super.stmt(stmt, context);
            if (context.generator) {
                if (stmt.type != 'BlockStatement') {
                    context.generator.stmt(stmt);
                    stmt = gen.empty;
                }
            }
            context.stmt = oldStmt;
            return stmt;
        },
        withGenerator: function (m, context, fn) {
            var __this = this;
            var lastGenerator = context.generator;
            var yields = [], stmts = [];
            var generator = context.generator = {
                    withcc: function (fn) {
                        var pre = stmts, cc = context.temp(), ccv = context.temp();
                        stmts = [];
                        stmt = fn(function (v) {
                            return generator.callc(cc, v);
                        });
                        stmts = pre;
                        pre.push(gen.block(stmt));
                        return ccv;
                    },
                    callc: function (c, v) {
                        console.log('callc', c, v);
                        var r = c.type == 'BlockStatement' ? c : gen.call(c, [v]);
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
                        return r.type == 'CallExpression' ? gen.ret(r) : r;
                    },
                    yield: function (expr) {
                        var e = 'e', t = context.temp();
                        console.log('yield', expr, stmts);
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
            return generator.callc(gen.block(stmts.concat([{
                    type: 'ThrowStatement',
                    argument: gen.ident('StopIteration')
                }])));
        },
        generator: function (m, context) {
            var __this = this;
            var body = this.withGenerator(m, context, function () {
                    console.log('gen');
                    return __this.super.generator(m, context);
                });
            m.body.body = [gen.ret(gen.call('__gen', [gen.fn([body.type.indexOf('Expression') > 0 ? gen.ret(body) : body], [
                        '__yield',
                        '__stop'
                    ])]))];
            m.generator = false;
            console.log('gen done');
            console.log(m);
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
        generator: function () {
            var __this = this;
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
function genGeneratorExpr(expr) {
    var __this = this;
    return genGenerator(genYield(expr));
}
var YIELD = '__yield';