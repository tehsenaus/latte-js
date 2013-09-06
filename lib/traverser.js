var __this = this;
var flatten = require('mout/array/flatten'), util = require('util');
function traverser(args) {
    var __this = this;
    var me = {};
    me.context = function () {
        return {
            scopes: [],
            blocks: [],
            enterScope: function (node) {
                var __this = this;
                var scope = this.enterBlock(node), temp = 0;
                scope.temp = function () {
                    var __this = this;
                    return '__t' + temp++;
                };
                this.scopes.unshift(scope);
                return scope;
            },
            exitScope: function () {
                var __this = this;
                this.scopes.shift();
                this.exitBlock();
            },
            scope: function (node, fn) {
                var __this = this;
                this.enterScope(node);
                try {
                    return fn(this);
                } finally {
                    this.exitScope();
                }
                ;
            },
            enterBlock: function (node) {
                var __this = this;
                var block = { node: node };
                this.blocks.unshift(block);
                return block;
            },
            exitBlock: function () {
                var __this = this;
                this.blocks.shift();
            },
            block: function (node, fn) {
                var __this = this;
                this.enterBlock(node);
                try {
                    return fn(this);
                } finally {
                    this.exitBlock();
                }
                ;
            },
            isBlockScope: function () {
                var __this = this;
                return this.scopes[0] === this.blocks[0];
            },
            temp: function () {
                var __this = this;
                return this.scopes[0].temp;
            }
        };
    };
    me.traverse = function (ast) {
        var context = me.context();
        return context.scope(ast, function (context) {
            ast.body = me.stmts(ast.body, context);
            return ast;
        });
    };
    me.stmts = function (stmts, context) {
        return flatten(stmts.map(function (stmt) {
            return me.stmt(stmt, context);
        }));
    };
    me.stmt = function (stmt, context) {
        if (!stmt)
            return stmt;
        switch (stmt.type) {
        case 'BlockStatement':
            return me.block(stmt, context);
        case 'VariableDeclaration':
            return me.varDecl(stmt, context);
        case 'FunctionDeclaration':
            return me.funcDecl(stmt, context);
        case 'ExpressionStatement':
            stmt.expression = me.expr(stmt.expression, context);
            return stmt;
        case 'IfStatement':
            return {
                type: 'IfStatement',
                test: stmt.test && me.expr(stmt.test, context),
                consequent: me.stmt(stmt.consequent, context),
                alternate: stmt.alternate && me.stmt(stmt.alternate, context)
            };
        case 'ForStatement':
            return {
                type: 'ForStatement',
                init: stmt.init && me.stmt(stmt.init, context),
                test: stmt.test && me.expr(stmt.test, context),
                update: stmt.update && me.expr(stmt.update, context),
                body: me.stmt(stmt.body, context)
            };
        case 'ForInStatement':
            return me.forInStmt(stmt, context);
        case 'WhileStatement':
        case 'DoWhileStatement':
            stmt.test = me.expr(stmt.test, context);
            stmt.body = me.stmt(stmt.body, context);
            return stmt;
        case 'SwitchStatement':
            stmt.discriminant = me.expr(stmt.discriminant, context);
            stmt.cases = stmt.cases.map(function (c) {
                c.consequent = me.stmts(c.consequent, context);
                return c;
            });
            return stmt;
        case 'ReturnStatement':
        case 'ThrowStatement':
            return {
                type: stmt.type,
                argument: me.expr(stmt.argument, context)
            };
        case 'TryStatement':
            stmt.block = me.stmt(stmt.block, context);
            stmt.handlers.forEach(function (handler) {
                handler.body = me.stmt(handler.body, context);
            });
            stmt.finalizer = stmt.finalizer && me.stmt(stmt.finalizer, context);
            return stmt;
        case 'BreakStatement':
            break;
        case undefined:
            throw new Error('Fatal: Stmt type is undefined! In: ' + util.inspect(stmt));
        default:
            console.log('Unhandled stmt: ', stmt.type);
        }
        return stmt;
    };
    me.block = function (stmt, context) {
        return context.block(stmt, function (context) {
            stmt.body = me.stmts(stmt.body, context);
            return stmt;
        });
    };
    me.forInStmt = function (stmt, context) {
        stmt.body = me.stmt(stmt.body, context);
        return stmt;
    };
    me.varDecl = function (stmt, context) {
        stmt.declarations = me.decls(stmt.declarations, context);
        return stmt;
    };
    me.decls = function (decls, context) {
        return flatten(decls.map(function (d) {
            return me.decl(d, context);
        }));
    };
    me.decl = function (decl, context) {
        decl.init = me.expr(decl.init, context);
        return decl;
    };
    me.funcDecl = function (fn, context) {
        return me.func(fn, context);
    };
    me.expr = function (expr, context) {
        if (!expr)
            return expr;
        switch (expr.type) {
        case 'FunctionExpression':
            return me.funcExpr(expr, context);
        case 'ArrowFunctionExpression':
            return me.arrowFuncExpr(expr, context);
        case 'CallExpression':
        case 'NewExpression':
            return {
                type: expr.type,
                callee: me.expr(expr.callee, context),
                arguments: expr.arguments.map(function (arg) {
                    return me.expr(arg, context);
                })
            };
        case 'ObjectExpression':
            return {
                type: 'ObjectExpression',
                properties: expr.properties.map(function (p) {
                    p.value = me.expr(p.value, context);
                    return p;
                })
            };
        case 'ArrayExpression':
            expr.elements = expr.elements.map(function (e) {
                return me.expr(e, context);
            });
            return expr;
        case 'ComprehensionExpression':
            return me.comprehension(expr, context);
        case 'MemberExpression':
            expr.object = me.expr(expr.object, context);
            expr.property = me.expr(expr.property, context);
            return expr;
        case 'AssignmentExpression':
            expr.right = me.expr(expr.right, context);
            return expr;
        case 'ConditionalExpression':
            expr.test = me.expr(expr.test, context);
            expr.consequent = me.expr(expr.consequent, context);
            expr.alternate = me.expr(expr.alternate, context);
            return expr;
        case 'BinaryExpression':
        case 'LogicalExpression':
            expr.left = me.expr(expr.left, context);
            expr.right = me.expr(expr.right, context);
            return expr;
        case 'UnaryExpression':
        case 'UpdateExpression':
            expr.argument = me.expr(expr.argument, context);
            return expr;
        case 'MonadExpression':
            return me.monad(expr, context);
        case 'Identifier':
            return me.ident(expr, context);
        case 'ThisExpression':
            return me.thisExpr(expr, context);
        case 'TemplateLiteral':
            return me.quasiLiteral(expr, context);
        case 'Literal':
            break;
        default:
            console.log('Unhandled expr: ', expr.type);
        }
        return expr;
    };
    me.arrowFuncExpr = function (fn, context) {
        fn.body = fn.body.type == 'BlockStatement' ? me.stmt(fn.body, context) : me.expr(fn.body, context);
        return fn;
    };
    me.funcExpr = function (fn, context) {
        return me.func(fn, context);
    };
    me.func = function (fn, context) {
        var doIt = function (context) {
            fn.body.body = me.stmts(fn.body.body, context);
            return fn;
        };
        return fn.noScope ? doIt(context) : context.scope(fn, doIt);
    };
    me.comprehension = function (c, context) {
        c.filter = c.filter && me.expr(c.filter);
        c.blocks.forEach(function (b) {
            b.right = me.expr(b.right);
        });
        c.body = me.expr(c.body);
        return c;
    };
    me.monad = function (m, context) {
        m.body = me.stmt(m.body, context);
        return m;
    };
    me.ident = function (x) {
        return x;
    };
    me.thisExpr = function (x) {
        return x;
    };
    me.quasiLiteral = function (x) {
        throw new Error('Unhandled quasi literal!');
    };
    me.super = {};
    for (var n in args) {
        me.super[n] = me[n];
        me[n] = args[n];
    }
    return me;
}
module.exports = traverser;