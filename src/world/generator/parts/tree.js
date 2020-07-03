var hash = require('murmur-numbers')
var ndarray = require('ndarray')
var blockIDs = require('../../../blocks').getIDs()

function generateOakTree(seed) {
	var gen = new ndarray( new Uint16Array(16 * 16 * 16), [16, 16, 16])
	var height = 4 + Math.round(seed)

	for (var y = 0; y < height; y++) {
		gen.set(8, y, 8, blockIDs.log)
	}


	for (var x = -2; x <= 2; x++) {
		for (var y = -2; y <= 2; y++) {
			for (var z = -2; z <= 2; z++) {
				if (gen.get(x+8, y+height, z+8) == 0 && hash(x, y, z, seed*2) > 0.3 && dist(x, y, z) <= 3) gen.set(x+8, y+height, z+8, blockIDs.leaves)
			}
		}
	}

	return gen
}




function dist(x, y, z) {
	return Math.sqrt(x*x + y*y + z*z)
}

module.exports = {
	oakTree: generateOakTree
}