var should = require('should');
describe('Quasi Literal', function () {
    it('returns basic string', function () {
        ['asdf'].join('').should.equal('asdf');
    });
    it('supports multilines', function () {
        ['asdf\nghjk'].join('').should.eql('asdf\nghjk');
    });
    it('supports escaped multiline', function () {
        ['asdfghjk'].join('').should.eql('asdfghjk');
    });
    it('makes substitutions', function () {
        var x = 'ghjk';
        [
            'asdf',
            x,
            'qwer'
        ].join('').should.eql('asdfghjkqwer');
    });
    it('substitutes expressions', function () {
        var x = 10;
        [
            'asdf',
            Math.pow(x, 3),
            'qwer'
        ].join('').should.eql('asdf1000qwer');
    });
});