var should = require('should');
describe('Array Comprehension', function () {
    it('enumerates an array', function () {
        var a = [
                10,
                20
            ];
        (function () {
            var __comp = [];
            for (var i in a) {
                __comp.push(a[i]);
            }
            return __comp;
        }().should.eql(a));
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
            for (var i in a) {
                for (var j in b) {
                    __comp.push(a[i] + b[j]);
                }
            }
            return __comp;
        }().should.eql([
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
                for (var i in a) {
                    if (a[i] % 2 == 0) {
                        __comp.push(a[i]);
                    }
                }
                return __comp;
            }();
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
            for (var k in a) {
                var v = a[k];
                __comp.push(k + '=' + v);
            }
            return __comp;
        }().join(' ').should.equal('x=a y=b'));
    });
    it('allows local variables as first statement', function () {
        var a = {
                x: 'a',
                y: 'b'
            };
        (function () {
            var __comp = [];
            var pre = 'Hello ';
            for (var k in a) {
                __comp.push(pre + k);
            }
            return __comp;
        }().join(', ').should.equal('Hello x, Hello y'));
    });
});