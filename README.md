# latte-js

*JavaScript, with a little milk &amp; sugar*

Latte is an extension of JavaScript, bringing features of CoffeeScript in a familiar JS syntax.

If you like CoffeeScript, but not the Rubyish syntax, Latte is for you.

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
