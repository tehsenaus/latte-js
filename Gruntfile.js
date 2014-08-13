module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    latte: {
      build: {
        inputDir: 'src/',
        outputDir: 'lib/'
      }
    },
    shell: {
      buildTest: {
        command: 'node bin/latte -c test/src/ -o test/out/ -m -M test/map/',
        options: {
            stdout: true,
            stderr: true,
            failOnError: true
        }
      },
      buildBenchmark: {
        command: 'node bin/latte -c benchmark/src/ -o benchmark/out/',
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
    },

    // Documentation generator
    groc: {
      javascript: [
        "src/**/*.latte", "README.md"
      ],
      options: {
        "out": "doc/"
      }
    },

    runBenchmark: {
      all: {
        src: ['benchmark/out/**/*.js'],
        dest: 'benchmark.csv'
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('latte');
  grunt.loadNpmTasks('grunt-groc');
  grunt.loadNpmTasks('grunt-benchmark');

  // Add in support for latte
  require('grunt-groc/node_modules/groc/lib/languages').JavaScript.nameMatchers.push('.latte');
  
  grunt.registerTask('build', ['latte:build']);

  grunt.registerTask('test', ['shell:buildTest', 'mochaTest']);

  // Default task(s).
  grunt.registerTask('default', ['build', 'test', 'groc']);

  grunt.renameTask('benchmark', 'runBenchmark');
  grunt.registerTask('benchmark', ['build', 'shell:buildBenchmark', 'runBenchmark'])
};
