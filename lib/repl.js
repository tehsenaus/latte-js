var __this = this;
var vm = require('vm'), compiler = require('./compiler');
module.exports = function () {
    var __this = this;
    var c = compiler({ interactive: true }), isContinuation = false;
    var repl = require('repl').start({
            eval: function (cmd, context, filename, callback) {
                var __this = this;
                if (!isContinuation)
                    c.once('data', function (data, enc) {
                        var __this = this;
                        try {
                            callback(null, vm.runInContext(data.toString(enc), context, filename));
                        } catch (e) {
                            callback(e);
                        }
                        isContinuation = false;
                    });
                isContinuation = true;
                c.write(cmd.slice(1, cmd.length - 1));
            }
        });
    repl.rli.on('SIGINT', function () {
        var __this = this;
        c.write(compiler.EOF);
    });
};