module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    latte: {
      build: {
        inputDir: 'src/',
        outputDir: 'lib/'
      },
      buildTest: {
        inputDir: 'test/src/',
        outputDir: 'test/out/'
      }
    },
    shell: {
      build: {
        command: 'node_modules\\.bin\\latte -c src/ -o lib/',
        options: {
            stderr: true,
            failOnError: true
        }
      },
      buildTest: {
        command: 'node bin/latte -c test/src/ -o test/out/',
        options: {
            stdout: true,
            stderr: true,
            failOnError: true
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'test/coverage'
        },
        src: ['test/**/*.js']
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          // use the quiet flag to suppress the mocha console output
          quiet: true,
          // specify a destination file to capture the mocha
          // output (the quiet option does not suppress this)
          captureFile: 'coverage.html'
        },
        src: ['test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadTasks('tasks');
  
  grunt.registerTask('build', ['shell:build']);

  grunt.registerTask('test', ['latte:buildTest', 'mochaTest']);

  // Default task(s).
  grunt.registerTask('default', ['build', 'test']);
};
