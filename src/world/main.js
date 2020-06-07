module.exports = {
	async chunk(x, z) { return await getChunk(x, z) },
	init(seed) { initWorldGen(seed) },
	setBlock(pos, id) { setBlock(pos, id) },
	getBlock(pos) { return getBlock(pos) },
	toChunk(pos) { return globalToChunk(pos) }

}

// storage for data from voxels that were unloaded
var loadedChunks = {}

const worldgen = require('./worldgen')
const ndarray = require('ndarray')
const blocks = require('../blocks').getIDs()

var chunkWitdh = 24
var chunkHeight = 120

var queue = []
var init = false


function globalToChunk(pos) {
	var xc = Math.floor(pos[0]/24)
	var zc = Math.floor(pos[2]/24)

	var xl = pos[0] % 24
	var yl = pos[1]
	var zl = pos[2] % 24

	return {
		id: [xc, zc],
		pos: [xl, yl, zl]
	}
}

function initWorldGen(seed) {
	worldgen.init(seed, blocks)
	init = true
}

function setBlock(pos, id) {
	var pos2 = globalToChunk(pos)

	loadedChunks[pos2.id].data.set(pos2.pos[0], pos2.pos[1], pos2.pos[2], id)
}

function getBlock(pos) {
	var pos2 = globalToChunk(pos)

	return loadedChunks[pos2.id].data.get(pos2.pos[0], pos2.pos[1], pos2.pos[2]
		)
}

function getChunk(id) {
	if (validateID(id) == false) return 
	if (loadedChunks[id] == undefined || loadedChunks[id].status == 1) {
		generateChunk(id)
		return loadedChunks[id]
	}
	else {
		return loadedChunks[id]
	}
}

async function generateChunk(id) {
	console.log('Gen', id)
	var chunk = new ndarray( new Uint16Array(chunkWitdh * chunkHeight * chunkWitdh), [chunkWitdh, chunkHeight, chunkWitdh])
	for (var x = 0; x < chunkWitdh; x++) {
		for (var z = 0; z < chunkWitdh; z++) {
			for (var y = 0; y < chunkHeight; y++) {
				chunk.set(x, y, z, worldgen.get(x+id[0]*24, y, z+id[1]*24))
			}
		}
	}
	for (var x = 0; x < chunkWitdh; x++) {
		for (var z = 0; z < chunkWitdh; z++) {
			for (var y = 0; y < chunkHeight; y++) {
				var a0 = chunk.get(x, y, z)
				var m1 = chunk.get(x, y-1, z)
				var a1 = chunk.get(x, y+1, z)

				if (a0 != 0 && a0 != blocks.water && a1 != blocks.water && a1 == 0) chunk.set(x, y, z, blocks.grass)
				else if (a0 != 0 && a1 != 0 && a0 != blocks.water) chunk.set(x, y, z, blocks.dirt)

			}
		}
	}
	loadedChunks[id] = {
		data: chunk,
		status: 10,
		version: 1
	}
}


function validateID(id) {
	if (id == null || id == undefined) return false

}