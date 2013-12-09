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
describe('For-of statement', function () {
    it('iterates over arrays', function () {
        var r = '';
        var __t0 = __iterator([
                'a',
                'b',
                'c'
            ]);
        while (true) {
            var x;
            try {
                x = __t0.next();
            } catch (e) {
                if (e === StopIteration)
                    break;
                throw e;
            }
            r += x;
        }
        r.should.equal('abc');
    });
});