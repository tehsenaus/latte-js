var __this = this;
module.exports = {
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
            'callee': callee,
            'arguments': args
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