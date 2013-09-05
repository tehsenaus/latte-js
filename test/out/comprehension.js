var __this = this;
var should = require('should');
describe('Array Comprehension', function () {
    var __this = this;
    it('enumerates an array', function () {
        var __this = this;
        var a = [
                10,
                20
            ];
        (function () {
            var __this = this;
            var __comp = [];
            for (var i in a)
                __comp.push(a[i]);
            return __comp;
        }().should.eql(a));
    });
    it('enumerates two arrays', function () {
        var __this = this;
        var a = [
                10,
                20
            ], b = [
                1,
                2
            ];
        (function () {
            var __this = this;
            var __comp = [];
            for (var i in a)
                for (var j in b)
                    __comp.push(a[i] + b[j]);
            return __comp;
        }().should.eql([
            11,
            12,
            21,
            22
        ]));
    });
    it('filters an array', function () {
        var __this = this;
        var a = [
                1,
                2,
                3,
                4,
                5,
                6
            ];
        var evens = function () {
                var __this = this;
                var __comp = [];
                for (var i in a)
                    if (a[i] % 2 == 0)
                        __comp.push(a[i]);
                return __comp;
            }();
        evens.should.eql([
            2,
            4,
            6
        ]);
    });
});