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
describe('Let Statement', function () {
    it('defines variables in block scope', function (done) {
        var a = [
                10,
                20
            ], r = 0;
        for (var i in a) {
            (function () {
                var x = a[i];
                process.nextTick(function () {
                    r += x;
                });
            }.call(this));
        }
        process.nextTick(function () {
            r.should.equal(30);
            done();
        });
    });
    it('works with for (in)', function (done) {
        var a = [
                10,
                20
            ], r = 0;
        Object.keys(a).forEach(function (i) {
            process.nextTick(function () {
                r += a[i];
            });
        });
        process.nextTick(function () {
            r.should.equal(30);
            done();
        });
    });
    it('works with for (of)', function (done) {
        var a = [
                10,
                20
            ], r = 0;
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
                process.nextTick(function () {
                    r += x;
                });
            }
        }
        process.nextTick(function () {
            r.should.equal(30);
            done();
        });
    });
    it('works with return statement', function () {
        var a = [
                10,
                20
            ];
        function f() {
            for (var __t1 in a) {
                try {
                    throw __t1;
                } catch (i) {
                    return a[i];
                }
            }
        }
        f().should.equal(10);
    });
});