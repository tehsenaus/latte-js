var __this = this;
var should = require('should');
describe('Array Destructuring', function () {
    var __this = this;
    it('extracts values from array', function () {
        var __this = this;
        var a = [
                10,
                20
            ];
        var __destructure = a, x = __destructure[0], y = __destructure[1];
        x.should.equal(10);
        y.should.equal(20);
    });
    it('evaluates rhs expression once', function () {
        var __this = this;
        var c = 0;
        var a = function () {
            var __this = this;
            c++;
            return [
                10,
                20
            ];
        };
        var __destructure = a(), x = __destructure[0], y = __destructure[1];
        x.should.equal(10);
        y.should.equal(20);
        c.should.equal(1);
    });
});