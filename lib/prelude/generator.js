var __this = this;
if (typeof StopIteration === 'undefined') {
    var StopIteration = 'StopIteration';
}
function __gen(fn) {
    var __this = this;
    var closed, born;
    return {
        next: function () {
            var __this = this;
            return this.send();
        },
        send: function (v) {
            var __this = this;
            if (closed)
                throw new Error('generator is closed!');
            if (!born) {
                var v = fn(function __yield(v, next) {
                        var __this = this;
                        fn = next;
                        return v;
                    }, function __stop() {
                        var __this = this;
                        closed = true;
                        throw StopIteration;
                    });
                born = true;
                return v;
            }
            return fn(null, v);
        },
        'throw': function (e) {
            var __this = this;
            if (closed)
                throw new Error('generator is closed!');
            if (!born) {
                throw e;
            }
            return fn(e);
        }
    };
}