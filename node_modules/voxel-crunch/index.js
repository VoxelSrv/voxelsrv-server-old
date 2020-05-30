var bits = require("bit-twiddle")

function size(chunk) {
  var count = 0
  var chunk_len = chunk.length
  var i = 0, v, l
  while(i<chunk.length) {
    v = chunk[i]
    l = 0
    while(i < chunk_len && chunk[i] === v) {
      ++i
      ++l
    }
    count += (bits.log2(l) / 7)|0
    count += (bits.log2(v>>>0) / 7)|0
    count += 2
  }
  return count
}
exports.size = size

function encode(chunk, runs) {
  if(!runs) {
    runs = new Uint8Array(size(chunk))
  }
  var rptr = 0, nruns = runs.length
  var i = 0, v, l
  while(i<chunk.length) {
    v = chunk[i]
    l = 0
    while(i < chunk.length && chunk[i] === v) {
      ++i
      ++l
    }
    while(rptr < nruns && l >= 128) {
      runs[rptr++] = 128 + (l&0x7f)
      l >>>= 7
    }
    if(rptr >= nruns) {
      throw new Error("RLE buffer overflow")
    }
    runs[rptr++] = l
    v >>>= 0
    while(rptr < nruns && v >= 128) {
      runs[rptr++] = 128 + (v&0x7f)
      v >>>= 7
    }
    if(rptr >= nruns) {
      throw new Error("RLE buffer overflow")
    }
    runs[rptr++] = v
  }
  return runs
}
exports.encode = encode

function decode(runs, chunk) {
  var buf_len = chunk.length
  var nruns = runs.length
  var cptr = 0
  var ptr = 0
  var l, s, v, i
  while(ptr < nruns) {
    l = 0
    s = 0
    while(ptr < nruns && runs[ptr] >= 128) {
      l += (runs[ptr++]&0x7f) << s
      s += 7
    }
    l += runs[ptr++] << s
    if(ptr >= nruns) {
      throw new Error("RLE buffer underrun")
    }
    if(cptr + l > buf_len) {
      throw new Error("Chunk buffer overflow")
    }
    v = 0
    s = 0
    while(ptr < nruns && runs[ptr] >= 128) {
      v += (runs[ptr++]&0x7f) << s
      s += 7
    }
    if(ptr >= nruns) {
      throw new Error("RLE buffer underrun")
    }
    v += runs[ptr++] << s
    for(i=0; i<l; ++i) {
      chunk[cptr++] = v
    }
  }
  return chunk
}
exports.decode = decode
