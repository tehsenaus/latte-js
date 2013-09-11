var should = require('should');
var Q = require('q');
describe('Monad Expression', function () {
    function async(x) {
        var d = Q.defer();
        setTimeout(function () {
            return d.resolve(x);
        }, 100);
        return d.promise;
    }
    it('flattens async control flow', function (done) {
        function async(x) {
            var d = Q.defer();
            setTimeout(function () {
                return d.resolve(x);
            }, 100);
            return d.promise;
        }
        (function () {
            var __b = function (v, n) {
                return typeof v.then == 'function' ? v.then(n) : n(v);
            };
            {
                return __b(async('Meee'), function (__t0) {
                    var x = __t0;
                    ;
                    ;
                    x.should.equal('Meee');
                    done();
                });
            }
        }());
    });
    it('works with conditionals', function (done) {
        (function () {
            var __b = function (v, n) {
                return typeof v.then == 'function' ? v.then(n) : n(v);
            };
            {
                return __b(true ? function () {
                    var __b = function (v, n) {
                        return typeof v.then == 'function' ? v.then(n) : n(v);
                    };
                    {
                        return __b(async('Meee'), function (__t0) {
                            return __t0;
                        });
                    }
                }() : 'You', function (__t1) {
                    var x = __t1;
                    ;
                    ;
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
            var __b = function (v, n) {
                return typeof v.then == 'function' ? v.then(n) : n(v);
            };
            {
                return __b(false ? function () {
                    var __b = function (v, n) {
                        return typeof v.then == 'function' ? v.then(n) : n(v);
                    };
                    {
                        return __b(async('Meee'), function (__t0) {
                            return __t0;
                        });
                    }
                }() : 'You', function (__t1) {
                    var x = __t1;
                    ;
                    ;
                    ;
                    x.should.equal('You');
                    asyncCalled.should.equal(false);
                    done();
                });
            }
        }());
    });
    it('works with logical expression', function (done) {
        (function () {
            var __b = function (v, n) {
                return typeof v.then == 'function' ? v.then(n) : n(v);
            };
            {
                return __b(true && function () {
                    var __b = function (v, n) {
                        return typeof v.then == 'function' ? v.then(n) : n(v);
                    };
                    {
                        return __b(async('Meee'), function (__t0) {
                            return __t0;
                        });
                    }
                }(), function (__t1) {
                    var x = __t1;
                    ;
                    ;
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
            var __b = function (v, n) {
                return typeof v.then == 'function' ? v.then(n) : n(v);
            };
            {
                return __b('You' || function () {
                    var __b = function (v, n) {
                        return typeof v.then == 'function' ? v.then(n) : n(v);
                    };
                    {
                        return __b(async('Meee'), function (__t0) {
                            return __t0;
                        });
                    }
                }(), function (__t1) {
                    var x = __t1;
                    ;
                    ;
                    ;
                    x.should.equal('You');
                    asyncCalled.should.equal(false);
                    done();
                });
            }
        }());
    });
});