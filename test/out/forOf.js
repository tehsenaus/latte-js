function __iter(v, f) {
    v.forEach(f);
}
var should = require('should');
describe('For-of statement', function () {
    it('iterates over arrays', function () {
        var r = '';
        __iter([
            'a',
            'b',
            'c'
        ], function (x) {
            r += x;
        });
        r.should.equal('abc');
    });
});