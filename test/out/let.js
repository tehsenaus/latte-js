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
            }());
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
});