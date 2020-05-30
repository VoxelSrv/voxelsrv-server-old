voxel-crunch
============
This library applies run length encoding to an array of octets, and returns the result.  It can be used to compress individual chunks in voxel.js, or more generally any array of ints.

Though this is designed to work with voxel.js, the code in this library is sufficiently generic that it can run length encode any int-like array.

Installation
============
Via npm:

    npm install voxel-crunch

Example
=======

    var data = chunk.voxels
    //First encode data
    var rle = require("voxel-crunch").encode(data)
    //Then decode
    var result = require("voxel-crunch").decode(rle, new Uint32Array(data.length))
    //Now
    //    result == data

## `require("voxel-crunch").size(chunk)`
Counts the number of bytes required to run length encode chunk

* `chunk` is the chunk to be encoded

**Returns** A number representing the minimal number of bytes necessary to compress chunk

**Returns** The number of runs required to compress the chunk

## `require("voxel-crunch").encode(chunk[, result])`
Run length encodes an array of int-like objects

* `chunk` is either an array-like object
* `result` is an optional array argument which stores the result of the encoding.  If not specified, a Uint8Array is allocated.

**Returns** If `result` is specified, then `result` is returned.  Otherwise a new array is allocated.

**Throws** An error if the result buffer is too small

## `require("voxel-crunch").decode(runs, result)`
This method decodes a crunched chunk back into a full chunk.  It takes 3 arguments:

* `runs` is the crunched chunk
* `result` is an array which gets the result of unpacking the voxels

If the runs are not valid or if the bounds on the chunk are exceeded, an error will be thrown.

**Returns** `result`

**Throws** An error if either result is too small or runs is invalid.

Credits
=======
(c) 2013 Mikola Lysenko. BSD
