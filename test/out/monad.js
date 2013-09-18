var __when = function (v, n) {
    return v && typeof v.then == 'function' ? v.then(n) : n(v);
};
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
            {
                return __when(async('Meee'), function (__t0) {
                    ;
                    ;
                    ;
                    var x = __t0;
                    x.should.equal('Meee');
                    done();
                });
            }
        }());
    });
    it('allows multiple binds', function (done) {
        (function () {
            {
                return __when(async('Meee'), function (__t0) {
                    var x = __t0;
                    x.should.equal('Meee');
                    return __when(async('You'), function (__t1) {
                        ;
                        ;
                        ;
                        ;
                        ;
                        var y = __t1;
                        y.should.equal('You');
                        done();
                    });
                });
            }
        }().done());
    });
    it('works with conditionals', function (done) {
        (function () {
            {
                return __when(true ? function () {
                    {
                        return __when(async('Meee'), function (__t0) {
                            ;
                            return __t0;
                        });
                    }
                }() : 'You', function (__t1) {
                    ;
                    ;
                    ;
                    var x = __t1;
                    x.should.equal('Meee');
                    done();
                });
            }
        }());
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
            {
                return __when(false ? function () {
                    {
                        return __when(async('Meee'), function (__t0) {
                            ;
                            return __t0;
                        });
                    }
                }() : 'You', function (__t1) {
                    ;
                    ;
                    ;
                    ;
                    var x = __t1;
                    x.should.equal('You');
                    asyncCalled.should.equal(false);
                    done();
                });
            }
        }());
    });
    it('works with logical expression', function (done) {
        (function () {
            {
                return __when(true && function () {
                    {
                        return __when(async('Meee'), function (__t0) {
                            ;
                            return __t0;
                        });
                    }
                }(), function (__t1) {
                    ;
                    ;
                    ;
                    var x = __t1;
                    x.should.equal('Meee');
                    done();
                });
            }
        }());
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
            {
                return __when('You' || function () {
                    {
                        return __when(async('Meee'), function (__t0) {
                            ;
                            return __t0;
                        });
                    }
                }(), function (__t1) {
                    ;
                    ;
                    ;
                    ;
                    var x = __t1;
                    x.should.equal('You');
                    asyncCalled.should.equal(false);
                    done();
                });
            }
        }());
    });
    it('works with if statement', function (done) {
        (function () {
            {
                var x;
                return __when(true ? function () {
                    {
                        return __when(async('Meee'), function (__t0) {
                            ;
                            x = __t0;
                        });
                    }
                }() : function () {
                    {
                        ;
                        x = 'You';
                    }
                }(), function (__t1) {
                    ;
                    ;
                    ;
                    ;
                    __t1;
                    ;
                    x.should.equal('Meee');
                    done();
                });
            }
        }());
    });
});