var __this = this;
module.exports = {
    arrow: function (params, body) {
        var __this = this;
        return {
            'type': 'ArrowFunctionExpression',
            'id': null,
            'params': params.map(function (p) {
                return __this.ident(p);
            }),
            'defaults': [],
            'body': body,
            'rest': null,
            'generator': false,
            'expression': body.type != 'BlockStatement'
        };
    },
    closure: function (stmts, params, id) {
        var __this = this;
        params = params || [];
        return {
            'type': 'CallExpression',
            'callee': this.fn(stmts, params, id),
            'arguments': params.map(function (p) {
                return __this.ident(p);
            })
        };
    },
    keys: function (x) {
        var __this = this;
        return this.call(this.member('Object', 'keys'), [x]);
    },
    forEach: function (arr, stmts, itemId) {
        var __this = this;
        return {
            'type': 'ExpressionStatement',
            'expression': this.call(this.member(arr, 'forEach'), [this.fn(stmts, [itemId])])
        };
    },
    forEachKey: function (x, stmts, itemId) {
        var __this = this;
        return this.forEach(this.keys(x), stmts, itemId);
    },
    ifStmt: function (test, cons, alt) {
        var __this = this;
        return {
            'type': 'IfStatement',
            'test': test,
            'consequent': this.block(cons),
            'alternate': alt && this.block(alt)
        };
    },
    block: function (stmts) {
        var __this = this;
        return stmts instanceof Array ? {
            type: 'BlockStatement',
            body: stmts
        } : stmts.type == 'BlockStatement' ? stmts : this.block([stmts]);
    },
    varDecl: function (id, init, options) {
        var __this = this;
        return {
            'type': 'VariableDeclaration',
            'declarations': [this.decl(id, init)],
            'kind': options && options.kind || 'var'
        };
    },
    decl: function (id, init) {
        var __this = this;
        return {
            'type': 'VariableDeclarator',
            'id': this.ident(id),
            'init': init
        };
    },
    fn: function (stmts, params, id) {
        var __this = this;
        return {
            'type': 'FunctionExpression',
            'id': id && this.ident(id),
            'params': params.map(function (p) {
                return __this.ident(p);
            }),
            'defaults': [],
            'body': this.block(stmts),
            'rest': null,
            'generator': false,
            'expression': false
        };
    },
    fndecl: function (stmts, params, id) {
        var __this = this;
        return {
            'type': 'FunctionDeclaration',
            'id': id && this.ident(id),
            'params': params.map(function (p) {
                return __this.ident(p);
            }),
            'defaults': [],
            'body': this.block(stmts),
            'rest': null,
            'generator': false,
            'expression': false
        };
    },
    call: function (callee, args) {
        var __this = this;
        return {
            'type': 'CallExpression',
            'callee': this.ident(callee),
            'arguments': (args || []).map(function (a) {
                return __this.ident(a);
            })
        };
    },
    ret: function (arg) {
        var __this = this;
        return {
            type: 'ReturnStatement',
            argument: this.ident(arg)
        };
    },
    assign: function (left, right, op) {
        var __this = this;
        return {
            'type': 'AssignmentExpression',
            'operator': op || '=',
            'left': this.ident(left),
            'right': this.ident(right)
        };
    },
    assignStmt: function () {
        var __this = this;
        return this.exprStmt(this.assign.apply(this, arguments));
    },
    conditional: function (test, cons, alt) {
        var __this = this;
        return {
            type: 'ConditionalExpression',
            test: test,
            consequent: cons,
            alternate: alt
        };
    },
    exprStmt: function (e) {
        var __this = this;
        return e.type == 'ExpressionStatement' ? e : {
            type: 'ExpressionStatement',
            expression: e
        };
    },
    member: function (obj, property, options) {
        var __this = this;
        return {
            'type': 'MemberExpression',
            'computed': options && options.computed,
            'object': typeof obj == 'object' ? obj : this.ident(obj),
            'property': typeof property == 'object' ? property : options && options.computed ? this.val(property) : this.ident(property)
        };
    },
    not: function (expr) {
        var __this = this;
        return {
            'type': 'UnaryExpression',
            'operator': '!',
            'argument': expr
        };
    },
    ident: function (id) {
        var __this = this;
        return typeof id === 'string' ? {
            'type': 'Identifier',
            'name': id
        } : id;
    },
    lit: function (raw, value) {
        var __this = this;
        return {
            'type': 'Literal',
            'value': value === undefined ? eval(raw) : value,
            'raw': raw
        };
    },
    val: function (value) {
        var __this = this;
        return this.lit(JSON.stringify(value), value);
    },
    empty: { 'type': 'EmptyStatement' }
};