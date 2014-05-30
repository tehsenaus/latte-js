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

## The Language

Full documentation at http://lattejs.com

### ES6 Features

#### Arrow Functions

http://tc39wiki.calculist.org/es6/arrow-functions/

```
$ latte
> [1,2,3].map(x => x * x)
[ 1, 4, 9 ]
```

#### Destructuring Assignment
```
> var [x,y] = [10,20];
> x
10
> y
20
```

#### Template Literals (quasi-literals)
```
> `wow
I'm multiline!`
'wow\nI\'m multiline!'
```

```
> var x = 10, y = 3;
> `The answer is: ${ Math.pow(x,y) }`
'The answer is: 1000'
```

#### Array Comprehensions
```
> var s = "Hello world!";
undefined
> [s[i].charCodeAt(0) for (i in s)]
[ 72,
  101,
  108,
  108,
  111,
  32,
  119,
  111,
  114,
  108,
  100,
  33 ]
```

#### Let (block level variables)
```
let x = 'something';
```

```
for (let i in [...]) {
	...
}
```



## Changes

### 0.3.5
Allow monad binds in for loops.
Allow monad binds in test/update expressions in all supported control structures.

### 0.3.4
Fixed break and continue in monad blocks.
Fixed issue with monadic binds in a multiple-var-decl statement resulting in undefined references.

### 0.3.3
Fixed issue with using functions as part of a monad bind.

### 0.3.2
Various fixes.

### 0.3.1
Support for monads.
Initial support for ES6 generators.
For-of statement.

### 0.2.7
Array comprehension improvement

### 0.2.6
Clear module cache when evaluating script in-process

### 0.2.5
Array comprehension with variables
Set __dirname properly when evaluating script in-process

### 0.2.4
Array comprehensions
Command line improvements
For-in-if statement: `for (x in y if (x.is('awesome')))`

### 0.2.3
Array destructuring
Let statement
Support for more AST nodes (stops the noisy output)

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