
// Benchmark to compare Latte generator performance against native V8 generators.
// Run with --harmony flag:
// node --harmony benchmark/generator_native.js

var tests = require('./src/generator.latte').tests;

var suite = new (require('benchmark').Suite);

suite.add('trampoline', require('./src/generator.latte').tests['trampoline']);
suite.add('native generator', require('./src/generator.latte').tests['generator']);
suite.add('latte generator', require('./out/generator').tests['generator']);
try {
	suite.add('regenerator generator', require('./out/generator-regenerator').tests['generator'])
} catch (e) {};

suite.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run();
