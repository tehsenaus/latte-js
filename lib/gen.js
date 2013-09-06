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
            'expression': true
        };
    },
    closure: function (stmts, params) {
        var __this = this;
        params = params || [];
        return {
            'type': 'CallExpression',
            'callee': this.fn(stmts, params),
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
    block: function (stmts) {
        var __this = this;
        return {
            type: 'BlockStatement',
            body: stmts
        };
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
    fn: function (stmts, params) {
        var __this = this;
        return {
            'type': 'FunctionExpression',
            'id': null,
            'params': params.map(function (p) {
                return __this.ident(p);
            }),
            'defaults': [],
            'body': {
                'type': 'BlockStatement',
                'body': stmts
            },
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
            'arguments': args.map(function (a) {
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
    }
};