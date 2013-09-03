var __this = this;
var flatten = require('mout/array/flatten'), util = require('util');
function traverser(args) {
    var __this = this;
    var me = {};
    me.funcContext = function (parent) {
        var temp = 0;
        return {
            temp: function () {
                var __this = this;
                return '__t' + temp++;
            }
        };
    };
    me.traverse = function (ast) {
        ast.body = me.stmts(ast.body);
        return ast;
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
            stmt.body = me.stmts(stmt.body);
            return stmt;
        case 'VariableDeclaration':
            stmt.declarations = me.decls(stmt.declarations, context);
            return stmt;
        case 'FunctionDeclaration':
            return me.funcDecl(stmt);
        case 'ExpressionStatement':
            stmt.expression = me.expr(stmt.expression);
            return stmt;
        case 'IfStatement':
            return {
                type: 'IfStatement',
                test: stmt.test && me.expr(stmt.test),
                consequent: me.stmt(stmt.consequent),
                alternate: stmt.alternate && me.stmt(stmt.alternate)
            };
        case 'ForStatement':
            return {
                type: 'ForStatement',
                init: stmt.init && me.stmt(stmt.init),
                test: stmt.test && me.expr(stmt.test),
                update: stmt.update && me.expr(stmt.update),
                body: me.stmt(stmt.body)
            };
        case 'WhileStatement':
        case 'DoWhileStatement':
            stmt.test = me.expr(stmt.test);
            stmt.body = me.stmt(stmt.body);
            return stmt;
        case 'SwitchStatement':
            stmt.discriminant = me.expr(stmt.discriminant);
            stmt.cases = stmt.cases.map(function (c) {
                c.consequent = me.stmts(c.consequent);
                return c;
            });
            return stmt;
        case 'ReturnStatement':
        case 'ThrowStatement':
            return {
                type: stmt.type,
                argument: me.expr(stmt.argument)
            };
        case undefined:
            throw new Error('Fatal: Stmt type is undefined! In: ' + util.inspect(stmt));
        default:
            console.log('Unhandled stmt: ', stmt.type);
            return stmt;
        }
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
    me.funcDecl = function (fn) {
        return me.func(fn);
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
                    p.value = me.expr(p.value, { lexicalThis: context && context.assignee });
                    return p;
                })
            };
        case 'ArrayExpression':
            expr.elements = expr.elements.map(function (e) {
                return me.expr(e, context);
            });
            return expr;
        case 'MemberExpression':
            expr.object = me.expr(expr.object);
            expr.property = me.expr(expr.property);
            return expr;
        case 'AssignmentExpression':
            expr.right = me.expr(expr.right, { assignee: expr.left });
            return expr;
        case 'ConditionalExpression':
            expr.test = me.expr(expr.test);
            expr.consequent = me.expr(expr.consequent);
            expr.alternate = me.expr(expr.alternate);
            return expr;
        case 'BinaryExpression':
        case 'LogicalExpression':
            expr.left = me.expr(expr.left, context);
            expr.right = me.expr(expr.right, context);
            return expr;
        case 'UnaryExpression':
        case 'UpdateExpression':
            expr.argument = me.expr(expr.argument);
            return expr;
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
    me.arrowFuncExpr = function (fn) {
        return fn;
    };
    me.funcExpr = function (fn) {
        return me.func(fn);
    };
    me.func = function (fn) {
        fn.body.body = me.stmts(fn.body.body);
        return fn;
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