
var compiler = require("../lib/compiler");

module.exports = function(grunt) {

	grunt.registerMultiTask('latte', function () {
		var done = this.async();
		compiler.compileDir(this.data.inputDir, this.data.outputDir, this.data.options || {})
		.on('end', function () {
			done();
		})
		.on('error', function (e) {
			console.error('*** error:', e);
			done(false);
		})
	});

}
