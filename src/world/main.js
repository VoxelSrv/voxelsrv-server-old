
// storage for data from voxels that were unloaded
var loadedChunks = {}
var loadedChunksData = {}


var worldgen
const ndarray = require('ndarray')
const blocks = require('../blocks').getIDs()
const storage = require('./storage')

var chunkWitdh = 24
var chunkHeight = 120
var version = 1

var lastChunk = 5000

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
	worldgen = require('./generator/' + cfg.generator)
	worldgen.init(cfg.seed, blocks)
	if (cfg.border != 0) lastChunk = cfg.border
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
	if (loadedChunksData[id] == undefined && storage.existData(id[0] + ',' + id[1]) == false) {
		generateChunk(id)
		return loadedChunks[id]
	}
	else if (loadedChunksData[id] != undefined) {
		return loadedChunks[id]
	}
	
	else if (storage.exist(id[0] + ',' + id[1])) {
		var newid = new String(id[0] + ',' + id[1])
		loadedChunks[id] = storage.read(newid)
		loadedChunksData[id] = storage.readData(newid)
		return loadedChunks[id]
	}
}

async function getChunkData(id) {
	if (validateID(id) == false) return
	if (loadedChunksData[id] == undefined && storage.existData(id[0] + ',' + id[1]) == false) {
		return undefined
	}
	else if (loadedChunksData[id] != undefined) {
		return loadedChunksData[id]
	}
	else if (storage.existData(id[0] + ',' + id[1])) {
		var newid = new String(id[0] + ',' + id[1])
		loadedChunksData[id] = storage.readData(newid)
		return loadedChunksData[id]
	}
}

async function generateChunk(id) {
	if (loadedChunks[id] == undefined && storage.exist(id[0] + ',' + id[1]) == false) {
		var chunk = new ndarray( new Uint16Array(chunkWitdh * chunkHeight * chunkWitdh), [chunkWitdh, chunkHeight, chunkWitdh])
	} else if (loadedChunks[id] == undefined && storage.exist(id[0] + ',' + id[1]) == true) {
		var chunk = storage.read(id)
	} else {
		var chunk = loadedChunks[id]
	}

	chunk = worldgen.generate(id, chunk)


	/*for (var x = 0; x < chunkWitdh; x++) {
		for (var z = 0; z < chunkWitdh; z++) {
			for (var y = 0; y < chunkHeight; y++) {
				var block = 0
				if (y == 20) block = blocks.grass
				else if (17 < y && y < 20) block = blocks.dirt
				else if ( y <= 17) block = blocks.stone

				if (block != 0) chunk.set(x, y, z, block)
			}
		}
	}*/
	
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
	loadedChunksData[id] = {gen: true, ver: version}

	storage.save(id[0] + ',' + id[1], loadedChunks[id], loadedChunksData[id])
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
		storage.save(c, loadedChunks[c], loadedChunksData[c])
	})
	console.log('World saved!')
}, 30000)


module.exports = {
	async chunk(x, z) { return await getChunk(x, z) },
	init: initWorldGen,
	setBlock: setBlock,
	getBlock: getBlock,
	toChunk: globalToChunk,
	setChunk(id, data) {
		loadedChunks[id] = data
		storage.save(id[0] + ',' + id[1], loadedChunks[id], loadedChunksData[id])
	},
	setChunkData(id, data) {
		loadedChunksData[id] = data
		storage.save(id[0] + ',' + id[1], loadedChunks[id], loadedChunksData[id])
	},
	getChunk(id) {
		return loadedChunks[id]
	},
	getChunkData(id, data) {
		return loadedChunksData[id]

	}

}
