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
describe('Array Comprehension', function () {
    it('enumerates an array', function () {
        var a = [
                10,
                20
            ];
        (function () {
            var __comp = [];
            Object.keys(a).forEach(function (i) {
                __comp.push(a[i]);
            });
            return __comp;
        }.call(this).should.eql(a));
    });
    it('enumerates two arrays', function () {
        var a = [
                10,
                20
            ], b = [
                1,
                2
            ];
        (function () {
            var __comp = [];
            Object.keys(a).forEach(function (i) {
                Object.keys(b).forEach(function (j) {
                    __comp.push(a[i] + b[j]);
                });
            });
            return __comp;
        }.call(this).should.eql([
            11,
            12,
            21,
            22
        ]));
    });
    it('filters an array', function () {
        var a = [
                1,
                2,
                3,
                4,
                5,
                6
            ];
        var evens = function () {
                var __comp = [];
                Object.keys(a).forEach(function (i) {
                    if (a[i] % 2 == 0) {
                        __comp.push(a[i]);
                    }
                });
                return __comp;
            }.call(this);
        evens.should.eql([
            2,
            4,
            6
        ]);
    });
    it('allows local variables', function () {
        var a = {
                x: 'a',
                y: 'b'
            };
        (function () {
            var __comp = [];
            Object.keys(a).forEach(function (k) {
                var v = a[k];
                __comp.push(k + '=' + v);
            });
            return __comp;
        }.call(this).join(' ').should.equal('x=a y=b'));
    });
    it('allows local variables as first statement', function () {
        var a = {
                x: 'a',
                y: 'b'
            };
        (function () {
            var __comp = [];
            var pre = 'Hello ';
            Object.keys(a).forEach(function (k) {
                __comp.push(pre + k);
            });
            return __comp;
        }.call(this).join(', ').should.equal('Hello x, Hello y'));
    });
    it('enumerates an array with of', function () {
        var a = [
                10,
                20
            ];
        (function () {
            var __comp = [];
            var __t0 = __iterator(a);
            while (true) {
                try {
                    throw null;
                } catch (x) {
                    try {
                        x = __t0.next();
                    } catch (e) {
                        if (e === StopIteration)
                            break;
                        throw e;
                    }
                    __comp.push(x);
                }
            }
            return __comp;
        }.call(this).should.eql(a));
    });
    it('enumerates two arrays with of', function () {
        var a = [
                10,
                20
            ], b = [
                1,
                2
            ];
        (function () {
            var __comp = [];
            var __t1 = __iterator(a);
            while (true) {
                try {
                    throw null;
                } catch (i) {
                    try {
                        i = __t1.next();
                    } catch (e) {
                        if (e === StopIteration)
                            break;
                        throw e;
                    }
                    var __t2 = __iterator(b);
                    while (true) {
                        try {
                            throw null;
                        } catch (j) {
                            try {
                                j = __t2.next();
                            } catch (e) {
                                if (e === StopIteration)
                                    break;
                                throw e;
                            }
                            __comp.push(i + j);
                        }
                    }
                }
            }
            return __comp;
        }.call(this).should.eql([
            11,
            12,
            21,
            22
        ]));
    });
    it('uses local variable binding scope', function (done) {
        var a = [
                10,
                20
            ], r = 0;
        (function () {
            var __comp = [];
            var __t3 = __iterator(a);
            while (true) {
                try {
                    throw null;
                } catch (x) {
                    try {
                        x = __t3.next();
                    } catch (e) {
                        if (e === StopIteration)
                            break;
                        throw e;
                    }
                    __comp.push(process.nextTick(function () {
                        return r += x;
                    }));
                }
            }
            return __comp;
        }.call(this));
        process.nextTick(function () {
            r.should.equal(30);
            done();
        });
    });
});