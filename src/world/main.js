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
const storage = require('./storage')

var chunkWitdh = 24
var chunkHeight = 120

var lastChunk = Infinity

var queue = []
var init = false


function globalToChunk(pos) {
	var xc = Math.floor(pos[0]/24)
	var zc = Math.floor(pos[2]/24)

	var xl = pos[0] % 24
	var yl = pos[1]
	var zl = pos[2] % 24

	if (xl < 0) xl = xl + 24
	if (zl < 0) zl = zl + 24

	return {
		id: [xc, zc],
		pos: [xl, yl, zl]
	}
}


function initWorldGen(cfg) {
	worldgen.init(cfg.seed, blocks)
	lastChunk = cfg.border
	init = true
}

function setBlock(pos, id) {
	var pos2 = globalToChunk(pos)

	loadedChunks[pos2.id].set(pos2.pos[0], pos2.pos[1], pos2.pos[2], id)
}

function getBlock(pos) {
	var pos2 = globalToChunk(pos)

	return loadedChunks[pos2.id].get(pos2.pos[0], pos2.pos[1], pos2.pos[2])
}

async function getChunk(id) {
	if (validateID(id) == false) return
	if (loadedChunks[id] == undefined && storage.exist(id[0] + ',' + id[1]) == false) {
		generateChunk(id)
		return loadedChunks[id]
	}
	else if (loadedChunks[id] != undefined) {
		return loadedChunks[id]
	}
	else if (storage.exist(id[0] + ',' + id[1])) {
		var newid = new String(id[0] + ',' + id[1])
		loadedChunks[id] = storage.read(newid)
		return loadedChunks[id]
	}
}

async function generateChunk(id) {
	var chunk = new ndarray( new Uint16Array(chunkWitdh * chunkHeight * chunkWitdh), [chunkWitdh, chunkHeight, chunkWitdh])

	for (var x = 0; x < chunkWitdh; x++) {
		for (var z = 0; z < chunkWitdh; z++) {
			for (var y = 0; y < chunkHeight; y++) {
				var block = 0
				if (y == 20) block = blocks.grass
				else if (17 < y && y < 20) block = blocks.dirt
				else if ( y < 17) block = blocks.stone


				chunk.set(x, y, z, block)
			}
		}
	}
	
	if (Math.abs(id[0]) == lastChunk || Math.abs(id[1]) == lastChunk) {
		for (var x = 0; x < chunkWitdh; x++) {
			for (var z = 0; z < chunkWitdh; z++) {
				for (var y = 0; y < chunkHeight; y++) {
					chunk.set(x, y, z, blocks.barrier)
				}
			}
		}
	}

	loadedChunks[id] = chunk

	storage.save(id[0] + ',' + id[1], loadedChunks[id])
}


function validateID(id) {
	if (id == null || id == undefined) return false
	else if (id[0] == null || id[0] == undefined) return false
	else if (id[1] == null || id[1] == undefined) return false
	else if (Math.abs(id[0]) > lastChunk || Math.abs(id[1]) > lastChunk) return false

}

setInterval(async function() {
	var chunks = Object.keys(loadedChunks)

	chunks.forEach(function(c) {
		storage.save(c, loadedChunks[c])
	})
	console.log('World saved!')
}, 30000)
