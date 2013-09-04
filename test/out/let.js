var __this = this;
var should = require('should');
describe('Let Statement', function () {
    var __this = this;
    it('defines variables in block scope', function (done) {
        var __this = this;
        var a = [
                10,
                20
            ], r = 0;
        for (var i in a) {
            (function () {
                var __this = this;
                var x = a[i];
                process.nextTick(function () {
                    var __this = this;
                    r += x;
                });
            }());
        }
        process.nextTick(function () {
            var __this = this;
            r.should.equal(30);
            done();
        });
    });
    it('works with for (in)', function (done) {
        var __this = this;
        var a = [
                10,
                20
            ], r = 0;
        Object.keys(a).forEach(function (i) {
            var __this = this;
            process.nextTick(function () {
                var __this = this;
                r += a[i];
            });
        });
        process.nextTick(function () {
            var __this = this;
            r.should.equal(30);
            done();
        });
    });
});