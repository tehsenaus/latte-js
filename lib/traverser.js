var __this = this;
function traverser(args) {
    var __this = this;
    var me = {};
    me.traverse = function (ast) {
        ast.body = me.stmts(ast.body);
        return ast;
    };
    me.stmts = function (stmts) {
        return stmts.map(function (stmt) {
            return me.stmt(stmt);
        });
    };
    me.stmt = function (stmt) {
        if (!stmt)
            return stmt;
        switch (stmt.type) {
        case 'BlockStatement':
            stmt.body = me.stmts(stmt.body);
            return stmt;
        case 'VariableDeclaration':
            stmt.declarations = me.decls(stmt.declarations);
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
        case 'SwitchStatement':
            stmt.discriminant = me.expr(stmt.discriminant);
            stmt.cases = stmt.cases.map(function (c) {
                c.consequent = me.stmts(c.consequent);
                return c;
            });
            return stmt;
        case 'ReturnStatement':
            return {
                type: 'ReturnStatement',
                argument: me.expr(stmt.argument)
            };
        default:
            console.log('Unhandled stmt: ', stmt.type);
            return stmt;
        }
    };
    me.decls = function (decls) {
        return decls.map(me.decl);
    };
    me.decl = function (decl) {
        decl.init = me.expr(decl.init);
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
            return {
                type: 'CallExpression',
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
        case 'MemberExpression':
            expr.object = me.expr(expr.object);
            expr.property = me.expr(expr.property);
            return expr;
        case 'AssignmentExpression':
            expr.right = me.expr(expr.right, { assignee: expr.left });
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