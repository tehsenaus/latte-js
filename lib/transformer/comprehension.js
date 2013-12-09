var traverser = require('../traverser'), gen = require('../gen');
var comprehensionTransformer = module.exports = traverser({
        comprehension: function (c, context) {
            var body = gen.block([{
                        'type': 'ExpressionStatement',
                        'expression': gen.call(gen.member('__comp', 'push'), [c.body])
                    }]);
            if (c.filter) {
                body = gen.block([{
                        'type': 'IfStatement',
                        'test': c.filter,
                        'consequent': body
                    }]);
            }
            c.blocks.reverse().forEach(function (b) {
                if (b.type == 'ComprehensionBlock') {
                    body = gen.block([{
                            'type': b.of ? 'ForOfStatement' : 'ForInStatement',
                            'left': {
                                'type': 'VariableDeclaration',
                                'declarations': [{
                                        'type': 'VariableDeclarator',
                                        'id': b.left,
                                        'init': null
                                    }],
                                'kind': 'let'
                            },
                            'right': b.right,
                            'body': body,
                            'each': false
                        }]);
                } else {
                    body.body.unshift(gen.varDecl(b.left, b.right));
                }
            });
            return this.expr(gen.closure([gen.varDecl('__comp', {
                    'type': 'ArrayExpression',
                    'elements': []
                })].concat(body.body).concat([{
                    'type': 'ReturnStatement',
                    'argument': gen.ident('__comp')
                }])), context);
        }
    });