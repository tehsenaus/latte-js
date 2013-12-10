if (typeof StopIteration === 'undefined') {
    var StopIteration = 'StopIteration';
}
function __gen(fn) {
    var closed, born;
    return {
        next: function () {
            return this.send();
        },
        send: function (v) {
            if (closed)
                throw new Error('generator is closed!');
            if (!born) {
                var v = fn(function __yield(v, next) {
                        fn = next;
                        return v;
                    }, function __stop() {
                        closed = true;
                        throw StopIteration;
                    });
                born = true;
                return v;
            }
            return fn(null, v);
        },
        'throw': function (e) {
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
                return __yield(42, function (e, __t1) {
                    __t1.should.equal('hello');
                    return __yield('bye', function (e, __t2) {
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
                    return __yield('Meee', function (e, __t5) {
                        return __t3(__t5);
                    });
                } else {
                    return __t3('You');
                }
                function __t3(__t4) {
                    var x = __t4;
                    x.should.equal('Meee');
                    return __yield('bye', function (e, __t6) {
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
                    return __yield('Meee', function (e, __t9) {
                        return __t7(__t9);
                    });
                } else {
                    return __t7('You');
                }
                function __t7(__t8) {
                    var x = __t8;
                    x.should.equal('You');
                    yielded.should.equal(false);
                    return __yield('bye', function (e, __t10) {
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
                var __t11 = true;
                if (__t11) {
                    return __yield('Meee', function (e, __t14) {
                        return __t12(__t14);
                    });
                } else {
                    return __t12(__t11);
                }
                function __t12(__t13) {
                    var x = __t13;
                    x.should.equal('Meee');
                    return __yield('bye', function (e, __t15) {
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
                var __t16 = 'You';
                if (!__t16) {
                    return __yield('Meee', function (e, __t19) {
                        return __t17(__t19);
                    });
                } else {
                    return __t17(__t16);
                }
                function __t17(__t18) {
                    var x = __t18;
                    x.should.equal('You');
                    yielded.should.equal(false);
                    return __yield('bye', function (e, __t20) {
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
                    return __yield('Meee', function (e, __t23) {
                        x = __t23;
                        return __t21(null);
                    });
                } else {
                    x = 'You';
                    return __t21(null);
                }
                function __t21(__t22) {
                    x.should.equal('Meee');
                    return __yield('bye', function (e, __t24) {
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
    it('works with while statement', function () {
        function g() {
            return __gen(function (__yield, __stop) {
                var i = 0;
                return function __t25() {
                    if (true) {
                        return __yield(i++, function (e, __t30) {
                            return __t25();
                            return __t28(null);
                        });
                    } else {
                        return __t28(null);
                    }
                    function __t28(__t29) {
                        return __t26();
                    }
                }.call(this);
                function __t26(__t27) {
                    __stop();
                }
            });
        }
        var i = g();
        i.next().should.equal(0);
        i.next().should.equal(1);
        i.next().should.equal(2);
    });
});