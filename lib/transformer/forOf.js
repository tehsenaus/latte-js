var traverser = require('../traverser'), gen = require('../gen'), esprima = require('../esprima-latte'), fs = require('fs'), path = require('path');
var iteratorSnip = fs.readFileSync(path.join(__dirname, 'snippets', 'iterator.js'), 'utf8');
var forOfTransformer = module.exports = traverser({
        forOfStmt: function (stmt, context) {
            context.ast['requires iterator prelude'] = true;
            var body = esprima.parse(iteratorSnip).body;
            var iter = gen.ident(context.temp());
            body[0].declarations[0].id = iter;
            body[0].declarations[0].init.arguments[0] = stmt.right;
            var loopBody = body[1].body.body;
            loopBody[0].kind = stmt.left.kind;
            loopBody[0].declarations[0].id = stmt.left.declarations[0].id;
            loopBody[1].block.body[0].expression.left = stmt.left.declarations[0].id;
            loopBody[1].block.body[0].expression.right.callee.object = iter;
            loopBody[2] = stmt.body;
            return this.stmt(gen.block(body), context);
        }
    });