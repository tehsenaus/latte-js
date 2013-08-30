var __this = this;
var should = require('should');
describe('Arrow Function', function () {
    var __this = this;
    it('returns undefined when empty', function () {
        var __this = this;
        var empty = function () {
        };
        should.equal(empty(), undefined);
    });
    it('single parameter case needs no parentheses around parameter list', function () {
        var __this = this;
        var identity = function (x) {
            return x;
        };
        identity('x').should.equal('x');
    });
    it('has no need for parentheses even for lower-precedence expression body', function () {
        var __this = this;
        var square = function (x) {
            return x * x;
        };
        square(4).should.equal(16);
    });
    it('needs parenthesized body to return an object literal expression', function () {
        var __this = this;
        var key_maker = function (val) {
            return { key: val };
        };
        key_maker('x').should.eql({ key: 'x' });
    });
    it('has only lexical \'\'this\'\', no dynamic \'\'this\'\'', function () {
        var __this = this;
        const obj = {
                method: function () {
                    var __this = this;
                    return function () {
                        return __this;
                    };
                }
            };
        obj.method()().should.equal(obj);
        var fake = { steal: obj.method() };
        fake.steal().should.equal(obj);
    });
});