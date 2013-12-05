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
var should = require('should');
var Q = require('q');
describe('Generators', function () {
    it('can yield values', function () {
        function g() {
            return __gen(function (__yield, __stop) {
                return __yield(42, function (e, __t0) {
                    __stop();
                });
            });
        }
        g().next().should.equal(42);
    });
    it('can accept values on yield', function () {
        function g() {
            return __gen(function (__yield, __stop) {
                return __yield(42, function (e, __t0) {
                    __t0.should.equal('hello');
                    return __yield('bye', function (e, __t1) {
                        __stop();
                    });
                });
            });
        }
        var i = g();
        i.next().should.equal(42);
        i.send('hello').should.equal('bye');
    });
    it('works with conditionals', function () {
        function g() {
            return __gen(function (__yield, __stop) {
                if (true) {
                    return __yield('Meee', function (e, __t2) {
                        return __t0(__t2);
                    });
                } else {
                    return __t0('You');
                }
                function __t0(__t1) {
                    var x = __t1;
                    x.should.equal('Meee');
                    return __yield('bye', function (e, __t3) {
                        __stop();
                    });
                }
            });
        }
        var i = g();
        var v = i.next();
        v.should.equal('Meee');
        i.send(v).should.equal('bye');
    });
    it('doesn\'t evaluate false conditional', function () {
        var yielded = false;
        function g() {
            return __gen(function (__yield, __stop) {
                if (false) {
                    return __yield('Meee', function (e, __t2) {
                        return __t0(__t2);
                    });
                } else {
                    return __t0('You');
                }
                function __t0(__t1) {
                    var x = __t1;
                    x.should.equal('You');
                    yielded.should.equal(false);
                    return __yield('bye', function (e, __t3) {
                        __stop();
                    });
                }
            });
        }
        var i = g();
        var v = i.next();
        yielded = true;
    });
    it('works with logical expression', function () {
        function g() {
            return __gen(function (__yield, __stop) {
                var __t0 = true;
                if (__t0) {
                    return __yield('Meee', function (e, __t3) {
                        return __t1(__t3);
                    });
                } else {
                    return __t1(__t0);
                }
                function __t1(__t2) {
                    var x = __t2;
                    x.should.equal('Meee');
                    return __yield('bye', function (e, __t4) {
                        __stop();
                    });
                }
            });
        }
        var i = g();
        var v = i.next();
        v.should.equal('Meee');
        i.send(v).should.equal('bye');
    });
    it('supports short circuit evaluation', function () {
        var yielded = false;
        function g() {
            return __gen(function (__yield, __stop) {
                var __t0 = 'You';
                if (!__t0) {
                    return __yield('Meee', function (e, __t3) {
                        return __t1(__t3);
                    });
                } else {
                    return __t1(__t0);
                }
                function __t1(__t2) {
                    var x = __t2;
                    x.should.equal('You');
                    yielded.should.equal(false);
                    return __yield('bye', function (e, __t4) {
                        __stop();
                    });
                }
            });
        }
        var i = g();
        var v = i.next();
        yielded = true;
        v.should.equal('bye');
    });
    it('works with if statement', function () {
        function g() {
            return __gen(function (__yield, __stop) {
                var x;
                if (true) {
                    return __yield('Meee', function (e, __t2) {
                        x = __t2;
                        return __t0(null);
                    });
                } else {
                    x = 'You';
                    return __t0(null);
                }
                function __t0(__t1) {
                    x.should.equal('Meee');
                    return __yield('bye', function (e, __t3) {
                        __stop();
                    });
                }
            });
        }
        var i = g();
        var v = i.next();
        v.should.equal('Meee');
        i.send(v).should.equal('bye');
    });
});