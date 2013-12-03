var __this = this;
function __when(v, n) {
    var __this = this;
    return v && typeof v.then === 'function' ? v.then(n) : n(v);
}
function __iter(v, f) {
    v.forEach(f);
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
        __when(async('Meee'), function (__t0) {
            var x = __t0;
            x.should.equal('Meee');
            done();
        });
    });
    it('allows multiple binds', function (done) {
        __when(async('Meee'), function (__t0) {
            var x = __t0;
            x.should.equal('Meee');
            return __when(async('You'), function (__t1) {
                var y = __t1;
                y.should.equal('You');
                done();
            });
        }).done();
    });
    it('works with conditionals', function (done) {
        __when(true ? __when(async('Meee'), function (__t0) {
            return __t0;
        }) : 'You', function (__t1) {
            var x = __t1;
            x.should.equal('Meee');
            done();
        });
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
        __when(false ? __when(async('Meee'), function (__t0) {
            return __t0;
        }) : 'You', function (__t1) {
            var x = __t1;
            x.should.equal('You');
            asyncCalled.should.equal(false);
            done();
        });
    });
    it('works with logical expression', function (done) {
        __when(true && __when(async('Meee'), function (__t0) {
            return __t0;
        }), function (__t1) {
            var x = __t1;
            x.should.equal('Meee');
            done();
        });
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
        __when('You' || __when(async('Meee'), function (__t0) {
            return __t0;
        }), function (__t1) {
            var x = __t1;
            x.should.equal('You');
            asyncCalled.should.equal(false);
            done();
        });
    });
    it('works with if statement', function (done) {
        (function () {
            var x;
            return __when(true ? __when(async('Meee'), function (__t0) {
                x = __t0;
            }) : function () {
                x = 'You';
            }(), function (__t1) {
                __t1;
                x.should.equal('Meee');
                done();
            });
        }());
    });
    it('works with for-in statement', function (done) {
        (function () {
            var x = '';
            var __t0;
            Object.keys({
                a: 1,
                b: 1
            }).forEach(function (i) {
                __t0 = __when(__t0, function () {
                    return __when(async(i), function (__t1) {
                        x += __t1;
                    });
                });
            });
            return __when(__t0, function (__t2) {
                __t2;
                x.should.equal('ab');
                done();
            });
        }());
    });
    it('works with for-of statement', function (done) {
        (function () {
            var r = '';
            var __t0;
            __iter([
                'a',
                'b',
                'c'
            ], function (x) {
                __t0 = __when(__t0, function () {
                    return __when(async(x), function (__t1) {
                        r += __t1;
                    });
                });
            });
            return __when(__t0, function (__t2) {
                __t2;
                r.should.equal('abc');
                done();
            });
        }());
    });
});