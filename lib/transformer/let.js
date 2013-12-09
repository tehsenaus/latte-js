var traverser = require('../traverser'), gen = require('../gen');
var letTransformer = module.exports = traverser({
        varDecl: function (d, context) {
            d = this.super.varDecl(d, context);
            if (d.kind == 'let') {
                d.kind = 'var';
                d.wasLet = true;
                context.blocks[0].block.requiresBlockScope = true;
            } else {
                context.blocks[0].block.requiresMixedScope = true;
            }
            return d;
        },
        forInStmt: function (stmt, context) {
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
            var block = this.super.block(b, context);
            if (b.requiresBlockScope && context.stmts[1].type.indexOf('Function') < 0) {
                var iife = !b.requiresMixedScope && !stmtHasBreakContinue(b) && !stmtHasReturn(b);
                if (iife) {
                    b.body = [{
                            'type': 'ExpressionStatement',
                            'expression': gen.closure(b.body, b.blockScopeParams)
                        }];
                } else {
                    b = insertTrapsTransformer.insertTraps(b);
                }
            }
            return b;
        }
    });
var insertTrapsTransformer = traverser({
        insertTraps: function (block) {
            var context = this.context();
            var topLevelStmts = [], stmts = topLevelStmts;
            context.insertTraps = {
                trap: function (id, expr) {
                    var cstmts = stmts;
                    stmts = [];
                    cstmts.push(genTrap(id, expr, stmts));
                },
                stmt: function (s) {
                    stmts.push(s);
                }
            };
            this.blockStmts(block.body, context);
            block.body = topLevelStmts;
            return block;
        },
        blockStmt: function (stmt, context) {
            if (stmt.type == 'VariableDeclaration' && stmt.wasLet) {
                stmt.declarations.forEach(function (d) {
                    context.insertTraps.trap(d.id, d.init || gen.ident('null'));
                });
            } else {
                context.insertTraps.stmt(this.super.blockStmt(stmt, context));
            }
            return gen.empty;
        },
        block: function (b, context) {
            return this.insertTraps(b);
        }
    });
function genTrap(id, expr, body) {
    return {
        'type': 'TryStatement',
        'block': {
            'type': 'BlockStatement',
            'body': [{
                    'type': 'ThrowStatement',
                    'argument': expr
                }]
        },
        'guardedHandlers': [],
        'handlers': [{
                'type': 'CatchClause',
                'param': gen.ident(id),
                'body': gen.block(body)
            }],
        'finalizer': null
    };
}
var hasBreakContinueTraverser = traverser({
        stmtHasBreakContinue: function (stmt) {
            var context = this.context();
            this.stmt(stmt, context);
            return context.hasBreakContinue;
        },
        stmt: function (stmt, context) {
            if (stmt.type == 'BreakStatement' || stmt.type == 'ContinueStatement') {
                context.hasBreakContinue = true;
            }
            return this.super.stmt(stmt, context);
        },
        forStmt: function (x) {
            return x;
        },
        forInOfStmt: function (x) {
            return x;
        },
        whileDoWhileStmt: function (x) {
            return x;
        },
        func: function (x) {
            return x;
        }
    });
function stmtHasBreakContinue(stmt) {
    return hasBreakContinueTraverser.stmtHasBreakContinue(stmt);
}
var hasReturnTraverser = traverser({
        stmtHasReturn: function (stmt) {
            var context = this.context();
            this.stmt(stmt, context);
            return context.hasReturn;
        },
        stmt: function (stmt, context) {
            if (stmt.type == 'ReturnStatement') {
                context.hasReturn = true;
            }
            return this.super.stmt(stmt, context);
        },
        func: function (x) {
            return x;
        }
    });
function stmtHasReturn(stmt) {
    return hasBreakContinueTraverser.stmtHasBreakContinue(stmt);
}
function dbg(v) {
    try {
        return require('escodegen').generate(v);
    } catch (e) {
        return v;
    }
}