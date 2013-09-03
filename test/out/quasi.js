var __this = this;
var should = require('should');
describe('Quasi Literal', function () {
    var __this = this;
    it('returns basic string', function () {
        var __this = this;
        ['asdf'].join('').should.equal('asdf');
    });
    it('supports multilines', function () {
        var __this = this;
        ['asdf\nghjk'].join('').should.eql('asdf\nghjk');
    });
    it('supports escaped multiline', function () {
        var __this = this;
        ['asdfghjk'].join('').should.eql('asdfghjk');
    });
    it('makes substitutions', function () {
        var __this = this;
        var x = 'ghjk';
        [
            'asdf',
            x,
            'qwer'
        ].join('').should.eql('asdfghjkqwer');
    });
    it('substitutes expressions', function () {
        var __this = this;
        var x = 10;
        [
            'asdf',
            Math.pow(x, 3),
            'qwer'
        ].join('').should.eql('asdf1000qwer');
    });
});