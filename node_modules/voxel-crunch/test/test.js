var crunch = require("../index.js")
  , iota = require("iota-array")
  , dup = require("dup")

require("tap").test("basic test", function(t) {


  function testEncode(data) {
    var runs = crunch.encode(data)
    var decoded = crunch.decode(runs, new data.constructor(data.length))
    
    t.equal(decoded.length, data.length)
    for(var i=0; i<data.length; ++i) {
      t.equal(decoded[i], data[i])
    }
  }
  
  testEncode([1<<30])
  testEncode(iota(31).map(function(x) { return (1<<x)>>>0 }))
  testEncode(iota(31).map(function(x) { return ((1<<x)>>>0)-1 }))
  testEncode(iota(30).map(function(x) { return ((1<<x)>>>0)+1 }))

  var data = [1, 2, 2, 3, 3, 3, 5]
  for(var i=0; i<128; ++i) {
    data.push(4)
  }
  for(var j=0; j<256; ++j) {
    data.push(5)
  }
  for(var k=0; k<(1<<9); ++k) {
    data.push(6)
  }
  testEncode(data)
  
  testEncode(dup(128, 0))
  testEncode(dup(127, 0))
  testEncode(dup(129, 0))
  testEncode(dup(512, 1246123))
  
  t.end();
});
