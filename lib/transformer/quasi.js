var traverser = require('../traverser'), gen = require('../gen');
var quasiTransformer = module.exports = traverser({
        quasiLiteral: function (q, context) {
            return makeDefaultQuasi(q.quasis, q.expressions.map(function (e) {
                return quasiTransformer.expr(e);
            }));
        }
    });
function makeLiteral(value, raw) {
    return {
        'type': 'Literal',
        'value': value,
        'raw': raw
    };
}
function makeDefaultQuasi(literals, exprs) {
    var elems = [], i = 0;
    while (i < literals.length - 1) {
        elems.push(makeLiteral(literals[i].value.cooked, literals[i].value.raw));
        elems.push(exprs[i++]);
    }
    elems.push(makeLiteral(literals[i].value.cooked, literals[i].value.raw));
    return {
        'type': 'CallExpression',
        'callee': {
            'type': 'MemberExpression',
            'computed': false,
            'object': {
                'type': 'ArrayExpression',
                'elements': elems
            },
            'property': {
                'type': 'Identifier',
                'name': 'join'
            }
        },
        'arguments': [{
                'type': 'Literal',
                'value': '',
                'raw': '\'\''
            }]
    };
}