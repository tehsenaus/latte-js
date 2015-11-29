# latte-js

*JavaScript, with a little milk &amp; sugar*

Latte is an extension of JavaScript, bringing features of CoffeeScript in a familiar JS syntax.

If you like CoffeeScript, but not the Rubyish syntax, Latte is for you.

http://lattejs.com

## Get Started
### Install
```
npm install -g latte
```
or
```
npm install --save-dev latte
```

### Usage
```
$ latte --help
Latte.js compiler.
Usage: latte [options] [--] files...

Options:
  -c, --compile  Compile input files. If not specified, evaluates the files.
  -o, --output   Output directory, to be used with --compile.
  --version      Show version
```

### Try the REPL
```
$ latte
> [1,2,3].map(x => x * x)
[ 1, 4, 9 ]
```

### Compile a directory of .latte files
```
latte -o lib/ -c src/
```

### Generate (inline) source maps too
```
latte -o lib/ -c src/ -m
```

## The Language

See the proper documentation at http://lattejs.com

### ES6 Features

- [Arrow functions](http://tc39wiki.calculist.org/es6/arrow-functions/)
- Generators
- Iterators
- Destructuring assignment
- Template strings
- Block-scoped variables ('let' statement)
- For-of statement
- Rest params
- Array spreads

### Latte JS Features

- Monad syntax (similar to Haskell) for flattening async control flow
- Array comprehensions
- Declare variables in array comprehensions (more functional programming goodness)
- Filter with 'if' in for-of/for-in statements

## Changes

### 0.4.1
- Registered .latte extension with Node.js, so .latte modules can be required (#15)
- Removed git:// dependencies

### 0.4.0
- Changed iterators & generators to reflect latest ES6 spec (no more StopIteration).
- Added benchmarks (just for generators, initially).
- Optimised generators for tail call emulation use case - performance is comparable to trampoline.
- Monads now implemented via generators - reusing control flow logic, and to allow use of native
  generators implementation where available (this will be a command line flag later on).
- Monads now properly support return statement (fixes #9).
- Added support for array spreads (via https://github.com/square/es6-spread).
- Added support for rest params (via https://github.com/thomasboyt/es6-rest-params).
- Added support for generating source maps (via https://github.com/benjamn/recast).

### 0.3.5
- Allow monad binds in for loops.
- Allow monad binds in test/update expressions in all supported control structures.

### 0.3.4
- Fixed break and continue in monad blocks.
- Fixed issue with monadic binds in a multiple-var-decl statement resulting in undefined references.

### 0.3.3
Fixed issue with using functions as part of a monad bind.

### 0.3.2
Various fixes.

### 0.3.1
- Support for monads.
- Initial support for ES6 generators.
- For-of statement.

### 0.2.7
Array comprehension improvement

### 0.2.6
Clear module cache when evaluating script in-process

### 0.2.5
- Array comprehension with variables
- Set __dirname properly when evaluating script in-process

### 0.2.4
- Array comprehensions
- Command line improvements
- For-in-if statement: `for (x in y if (x.is('awesome')))`

### 0.2.3
- Array destructuring
- Let statement
- Support for more AST nodes (stops the noisy output)

### 0.2.2
Basic quasi-literals support

### 0.2.1
Node 0.8 compatibility

### 0.2.0
Grunt task

### 0.1.0
Unix fixes

### 0.0.2
Initial release, arrow functions
