function __when(v, n) {
    return v && typeof v.then === 'function' ? v.then(n) : n(v);
}
if (typeof StopIteration === 'undefined') {
    var StopIteration = 'StopIteration';
}
function __iterator(v) {
    if (typeof v.iterator === 'function') {
        return v.iterator();
    }
    if (typeof v === 'string' || Object.prototype.toString.call(v) === '[object Array]') {
        var a = v, i = 0;
        return {
            next: function () {
                if (i < a.length) {
                    return a[i++];
                }
                throw StopIteration;
            }
        };
    }
    var o = v, a = Object.keys(o), i = 0;
    return {
        next: function () {
            if (i < a.length) {
                var k = a[i++];
                return [
                    k,
                    o[k]
                ];
            }
            throw StopIteration;
        }
    };
}
var should = require('should');
var Q = require('q');
describe('Monad Expression', function () {
    function async(x) {
        var d = Q.defer();
        setTimeout(function () {
            return d.resolve(x);
        }, 10);
        return d.promise;
    }
    it('flattens async control flow', function (done) {
        function async(x) {
            var d = Q.defer();
            setTimeout(function () {
                return d.resolve(x);
            }, 10);
            return d.promise;
        }
        (function () {
            return __when(async('Meee'), function (__t0) {
                var x = __t0;
                x.should.equal('Meee');
                done();
            });
        }.call(this));
    });
    it('allows multiple binds', function (done) {
        (function () {
            return __when(async('Meee'), function (__t1) {
                var x = __t1;
                x.should.equal('Meee');
                return __when(async('You'), function (__t2) {
                    var y = __t2;
                    y.should.equal('You');
                    done();
                });
            });
        }.call(this).done());
    });
    it('works with conditionals', function (done) {
        (function () {
            return __when(true ? function () {
                return __when(async('Meee'), function (__t3) {
                    return __t3;
                });
            }.call(this) : 'You', function (__t4) {
                var x = __t4;
                x.should.equal('Meee');
                done();
            });
        }.call(this));
    });
    it('doesn\'t evaluate false conditional', function (done) {
        var asyncCalled = false;
        function async(x) {
            asyncCalled = true;
            var d = Q.defer();
            setTimeout(function () {
                return d.resolve(x);
            }, 100);
            return d.promise;
        }
        (function () {
            return __when(false ? function () {
                return __when(async('Meee'), function (__t5) {
                    return __t5;
                });
            }.call(this) : 'You', function (__t6) {
                var x = __t6;
                x.should.equal('You');
                asyncCalled.should.equal(false);
                done();
            });
        }.call(this));
    });
    it('works with logical expression', function (done) {
        (function () {
            return __when(true && function () {
                return __when(async('Meee'), function (__t7) {
                    return __t7;
                });
            }.call(this), function (__t8) {
                var x = __t8;
                x.should.equal('Meee');
                done();
            });
        }.call(this));
    });
    it('supports short circuit evaluation', function (done) {
        var asyncCalled = false;
        function async(x) {
            asyncCalled = true;
            var d = Q.defer();
            setTimeout(function () {
                return d.resolve(x);
            }, 100);
            return d.promise;
        }
        (function () {
            return __when('You' || function () {
                return __when(async('Meee'), function (__t9) {
                    return __t9;
                });
            }.call(this), function (__t10) {
                var x = __t10;
                x.should.equal('You');
                asyncCalled.should.equal(false);
                done();
            });
        }.call(this));
    });
    it('works with if statement', function (done) {
        (function () {
            var x;
            return __when(true ? function () {
                return __when(async('Meee'), function (__t11) {
                    x = __t11;
                });
            }.call(this) : function () {
                x = 'You';
            }.call(this), function (__t12) {
                __t12;
                x.should.equal('Meee');
                done();
            });
        }.call(this));
    });
    it('works with for-in statement', function (done) {
        (function () {
            var x = '';
            var __t13;
            Object.keys({
                a: 1,
                b: 1
            }).forEach(function (i) {
                __t13 = __when(__t13, function () {
                    return function () {
                        return __when(async(i), function (__t14) {
                            x += __t14;
                        });
                    }.call(this);
                });
            });
            return __when(__t13, function (__t15) {
                __t15;
                x.should.equal('ab');
                done();
            });
        }.call(this));
    });
    it('works with for-of statement', function (done) {
        (function () {
            var r = '';
            var __t16;
            var __t21 = __iterator([
                    'a',
                    'b',
                    'c'
                ]);
            while (true) {
                try {
                    throw null;
                } catch (x) {
                    try {
                        x = __t21.next();
                    } catch (e) {
                        if (e === StopIteration)
                            break;
                        throw e;
                    }
                    __t16 = __when(__t16, function () {
                        return function () {
                            return __when(async(x), function (__t17) {
                                r += __t17;
                            });
                        }.call(this);
                    });
                }
            }
            return __when(__t16, function (__t18) {
                __t18;
                r.should.equal('abc');
                done();
            });
        }.call(this));
    });
    it('preserves lexical this', function (done) {
        (function () {
            (function () {
                return __when(async(this.m), function (__t19) {
                    __t19.should.equal('hello');
                    done();
                });
            }.call(this));
        }.call({ m: 'hello' }));
    });
    it('allows inner functions', function (done) {
        (function () {
            return __when(async(['hello']), function (__t20) {
                __t20.map(function (x) {
                    return x;
                }).join('').should.equal('hello');
                done();
            });
        }.call(this));
    });
});