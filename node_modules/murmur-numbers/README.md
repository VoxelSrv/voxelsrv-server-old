murmur-numbers
==========

Simple fork of Gary Court's [murmur3](https://github.com/garycourt/murmurhash-js) 
implementation.

The only important difference is the inputs and outputs - 
instead of hashing text into a 32-bit integer, this version takes a 
series of integers, and divides the output into a float in the range
`[0..1)` (i.e. same as `Math.random`).


**Installation:**

```shell    
npm install --save murmur-numbers
```

**Usage:**

```js    
var hash = require('murmur-numbers')

hash(5)               // 0.4604153847321868
hash(0, 5)            // 0.585702647222206
hash(5, 0)            // 0.8242928483523428
hash(5) === hash(5)   // true
```

