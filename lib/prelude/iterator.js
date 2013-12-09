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