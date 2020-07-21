const fs = require('./fs.js')

const ndarray = require('ndarray')
const crunch = require('voxel-crunch')
const console = require('./console')



const blockIDs = require('./blocks').getIDs()

var chunkWitdh = 24
var chunkHeight = 120

var lastChunk = 5000

var worlds = {}

var worldgen = {
	normal: require('./worldgen/normal'),
	flat: require('./worldgen/flat')
}

var baseMetadata = {gen: true, ver: 1}

function createWorld(name, seed, generator) {
	if ( existWorld(name) == false && worlds[name] == undefined ) {
		worlds[name] = new World(name, seed, generator, null)
		return worlds[name]
	} else { return null }
}

function loadWorld(name) {

	if ( existWorld(name) == true && worlds[name] == undefined ) {
		var data = JSON.parse( fs.readFileSync('./worlds/' + name + '/world.json') )


		worlds[name] = new World(name, data.seed, data.generator, data.version)

		return worlds[name]
	} else { return null }
}

function unloadWorld(name) {
	worlds[name].unload()
	console.log('Unloaded world ' + name)

}

function existWorld(name) {
	return fs.existsSync( './worlds/' + name)
}

function getWorld(name) {
	return worlds[name]
}

function validateID(id) {
	if (id == null || id == undefined) return false
	else if (id[0] == null || id[0] == undefined) return false
	else if (id[1] == null || id[1] == undefined) return false
}


function getHighestBlock(chunk, x, z) {
	for (var y = chunkHeight - 1; y >= 0; y = y - 1) {
		var val = chunk.get(x, y, z)
		if (val != 0) return {level: y, block: val}
	}
	return null
}

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

class World {
	constructor(name, seed, generator, ver) {
		this.name = name
		this.seed = seed
		this.generator = new worldgen[generator](seed, blockIDs)
		if (ver == null) this.version = 1
		else this.version = ver
		this.chunks = {}
		this.entities = {}
		this.folder = './worlds/' + name
		this.chunkFolder = './worlds/' + name + '/chunks'

		if (!fs.existsSync(this.folder) ) fs.mkdirSync(this.folder)
		if (!fs.existsSync(this.chunkFolder) ) fs.mkdirSync(this.chunkFolder)

		fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
			if (err) console.error ('Cant save world ' + this.name + '! Reason: ' + err);
		})

		this.autoSaveInterval = setInterval( async () => { this.saveAll() }, 30000)

		this.chunkUnloadInterval = setInterval( async () => { 
			var chunklist = Object.keys(this.chunks)
			chunklist.forEach( (id) => {
				if (Date.now() - this.chunks[id].lastUse >= 5000 && !!this.chunks[id].forceload) this.unloadChunk(id)
			})
		}, 1000)

	}

	async getChunk(id, bool) {
		if (this.chunks[id] != undefined) {
			return this.chunks[id]
		}
		else if ( this.existChunk(id).metadata ) {
			var data = this.readChunk(id)
			this.chunks[id] = new Chunk(id, data.chunk, data.metadata)
			return this.chunks[id]
		}
		if (bool) {
			if ( this.existChunk(id).chunk ) {
				var data = this.readChunk(id)
				this.chunks[id] = new Chunk(id, data.chunk, {...baseMetadata})
				return this.chunks[id]
			} else {
				var data = new ndarray( new Uint16Array(chunkWitdh * chunkHeight * chunkWitdh), [chunkWitdh, chunkHeight, chunkWitdh])

				var chunk = this.generator.generateChunk(id, data)
				this.chunks[id] = new Chunk(id, chunk, {...baseMetadata})

				return this.chunks[id]

			}
		}
	}

	existChunk(id) {
		var chk = fs.existsSync(this.chunkFolder + '/' + id + '.chk')
		var meta = fs.existsSync(this.chunkFolder + '/' + id + '.json')
		return {chunk: chk, metadata: meta}
	}

	saveAll() {
		var chunklist = Object.keys(this.chunks)

		fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
			if (err) console.error ('Cant save world ' + this.name + '! Reason: ' + err);
		})

		chunklist.forEach( (id) => { this.saveChunk(id) } )
	}

	saveChunk(id) {
		var chunk = this.chunks[id]

		var data = Buffer.from( crunch.encode(chunk.data.data) )

		fs.writeFile(this.chunkFolder + '/' + id +'.chk', data, function (err) {
			if (err) console.error ('Cant save chunk ' + id + '! Reason: ' + err)
		})
	
		fs.writeFile(this.chunkFolder + '/' + id + '.json', JSON.stringify(chunk.metadata), function (err) {
			if (err) console.error ('Cant save chunkdata ' + id + '! Reason: ' + err)
		})
	}

	readChunk(id) {
		var exist = this.existChunk(id)
		var chunk = null
		var meta = null
		if (exist.chunk) {
			var data = fs.readFileSync(this.chunkFolder + '/' + id + '.chk')
			var array = crunch.decode([...data], new Uint16Array(24*120*24) )
			chunk = new ndarray(array, [24, 120, 24])
		}
		if (exist.metadata) {
			var data = fs.readFileSync(this.chunkFolder + '/' + id + '.json')
			var meta = JSON.parse(data)
		}
		return {chunk: chunk, metadata: meta}
	}

	unloadChunk(id) {
		this.saveChunk(id)
		delete this.chunks[id]
	}

	getSettings() {
		return {
			name: this.name,
			seed: this.seed,
			generator: this.generator.name,
			version: this.version
		}
	}


	getBlock(data, bool) {
		var local = globalToChunk(data)
		if (this.chunks[local.id] != undefined) return this.chunks[local.id].data.get(local.pos[0], local.pos[1], local.pos[2])
	}

	setBlock(data, block, bool) {
		var local = globalToChunk(data)
		if (this.chunks[local.id] != undefined) this.chunks[local.id].data.set(local.pos[0], local.pos[1], local.pos[2], block)
	}

	unload() {
		this.saveAll()
		clearInterval(this.autoSaveInterval)
		clearInterval(this.chunkUnloadInterval)

		setTimeout(function() { delete worlds[this.name] }, 50)
	}
}


class Chunk {
	constructor(id, blockdata, metadata, bool) {
		this.id = id
		this.data = blockdata
		this.metadata = metadata
		this.lastUse = Date.now()
		this.forceload = !!bool
	}

	keepAlive() {
		this.lastUse = Date.now()
	}
}

module.exports = {
	create: createWorld,
	load: loadWorld,
	unload: unloadWorld,
	exist: existWorld,
	get: getWorld,
	getAll() { return worlds },
	toChunk: globalToChunk,
	validateID: validateID,
	addGenerator(name, worldgen) { worldgen[ name ] = worldgen } 
}