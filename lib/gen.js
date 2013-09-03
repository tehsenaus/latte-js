var __this = this;
module.exports = {
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
            'id': typeof id === 'string' ? {
                'type': 'Identifier',
                'name': id
            } : id,
            'init': init
        };
    },
    member: function (obj, property, options) {
        var __this = this;
        return {
            'type': 'MemberExpression',
            'computed': options && options.computed,
            'object': obj,
            'property': typeof property == 'object' ? property : this.val(property)
        };
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