var __this = this;
var esprima = require('../lib/esprima-latte'), escodegen = require('escodegen'), transform = require('../lib/transform'), es = require('event-stream'), fs = require('fs'), mkdirp = require('mkdirp'), path = require('path'), glob = require('glob'), util = require('util');
function compiler(options) {
    var __this = this;
    options = options || {};
    var interactive = options.interactive, encoding = options.encoding || 'utf8';
    var buf = [], ending = false;
    function compileBuffered() {
        var __this = this;
        var output = compile(buf.join(''), options);
        buf = [];
        return output;
    }
    var stream = es.map(function (data, callback) {
            var __this = this;
            if (data == compiler.EOF) {
                buf = [];
                return callback();
            }
            buf.push(data);
            if (interactive || ending) {
                try {
                    callback(null, compileBuffered());
                } catch (e) {
                    if (!interactive && options.debug) {
                        console.error(e.stack);
                    }
                    callback(interactive ? null : e);
                }
            } else {
                callback();
            }
        });
    var _end = stream.end;
    stream.end = function (data) {
        var __this = this;
        ending = true;
        stream.write(data || '');
        _end.call(this);
    };
    return stream;
}
module.exports = compiler;
compiler.EOF = '\x03';
compiler.files = function (options) {
    var __this = this;
    var inputDir = path.join(process.cwd(), options.inputDir), outputDir = path.join(process.cwd(), options.outputDir);
    var stream;
    return es.pipeline(es.split(), stream = es.map(function (file, cb) {
        var __this = this;
        if (!file)
            return cb();
        var filePath = path.join(inputDir, file), output = file.replace('.latte', '.js'), outputPath = path.join(outputDir, output);
        mkdirp(path.dirname(outputPath), null, function (err) {
            var __this = this;
            if (err)
                return cb(err);
            stream.emit('data', output);
            var compiler = compileFile(filePath, options);
            compiler.on('end', function () {
                var __this = this;
                cb(null);
            });
            compiler.on('error', function (e) {
                var __this = this;
                cb(file + ': ' + e);
            });
            compiler.pipe(fs.createWriteStream(outputPath));
        });
    }), es.join('\n'));
};
function compile(source, options) {
    var __this = this;
    var ast = esprima.parse(source);
    if (options.debug) {
        fs.writeFileSync('ast.debug.js', util.inspect(ast, null, null));
    }
    ast = transform(ast);
    if (options.debug) {
        fs.writeFileSync('ast.debug.transformed.js', util.inspect(ast, null, null));
    }
    return escodegen.generate(ast);
}
compiler.compile = compile;
function compileFile(file, options) {
    var __this = this;
    return fs.createReadStream(file).pipe(compiler(options));
}
compiler.compileFile = compileFile;
function compileFiles(files, options) {
    var __this = this;
    var fileCompiler = compiler.files(options);
    files.forEach(function (file) {
        fileCompiler.write(file + '\n');
    });
    fileCompiler.end();
    return fileCompiler;
}
compiler.compileFiles = compileFiles;
function compileDir(inputDir, outputDir, options) {
    var __this = this;
    options.inputDir = inputDir;
    options.outputDir = outputDir;
    var fileCompiler = compiler.files(options);
    glob(inputDir + '**/*.latte', function (err, files) {
        var __this = this;
        files.forEach(function (file) {
            var name = file.slice(inputDir.length);
            fileCompiler.write(name + '\n');
        });
        fileCompiler.end();
    });
    return fileCompiler;
}
compiler.compileDir = compileDir;
if (require.main == module) {
    require('./repl')();
}