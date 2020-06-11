module.exports = {
	init(seed, blocks) {initWorldGen(seed, blocks)},
	get(x, y, z) {return getBlock(x, y, z)},
	async generate(id, chunk) { return await generateChunk(id, chunk) },
	async replace(id, chunk) { return await replaceChunk(id, chunk) }

}

const { makeNoise2D, makeNoise3D } = require('open-simplex-noise')
var hash = require('murmur-numbers')
const { get } = require('../blocks')

var init = false
var blockIDs = {}
var heightNoise, caveNoise, biomeNoise1, biomeNoise2, biomeNoise3, seed, world, plantSeed

var biomeSpacing = 100 // Size of biomes

var chunkWitdh = 24
var chunkHeight = 120

var waterLevel = 58

function initWorldGen(newSeed, blocks) {
	init = true
	blockIDs = blocks
	seed = newSeed
	world = 'default'
	heightNoise = makeNoise2D(Math.round(seed * Math.sin(seed^1) * 10000))
	caveNoise = makeNoise3D(Math.round(seed * Math.sin(seed^2) * 10000))
	biomeNoise1 = makeNoise2D(Math.round(seed * Math.sin(seed^3) * 10000))
	biomeNoise2 = makeNoise2D(Math.round(seed * Math.sin(seed^4) * 10000))
	biomeNoise3 = makeNoise2D(Math.round(seed * Math.sin(seed^5) * 10000))
	plantSeed = Math.round(seed * Math.sin(seed^6) * 10000) 
}


function getBlock(x, y, z) {
	var m = biomeNoise2((x)/180, (z)/180)
	var r = getHeightMap(x, y, z, m)
	if (y <= r) return blockIDs.stone
	else if (y <= waterLevel) return blockIDs.water
	else return 0

	function getHeightMap(x, y, z, mountaines) {
		var dim = (caveNoise(x/50, y/50, z/50)+0.35)*50
		var dim2 = (caveNoise(x/20, y/20, z/20))*50
		var layer1 = heightNoise(x/140, z/140)*mountaines*20
		var layer2 = heightNoise(x/40, z/40)*20
		
		return Math.floor((dim*30+dim2*20+layer1*20+layer2*10-3)/65) + 50
	}
}

function getBiome(x, z, temperature, biomerng) {
	if (0.2 < temperature && biomerng == 1) return 'desert'
	else if ( -1 < temperature < -0.2 && biomerng == 1) return 'iceland'
	else if ( -0.3 < temperature < 0.3 && biomerng == 2) return 'forest'
	else return 'plants'
}

function generateChunk(id, chunk) {
	for (var x = 0; x < chunkWitdh; x++) {
		for (var z = 0; z < chunkWitdh; z++) {
			for (var y = 0; y < chunkHeight; y++) {
				chunk.set(x, y, z, getBlock(x+id[0]*24, y, z+id[1]*24))
			}
		}
	}
}

function replaceChunk(id, chunk) {
	for (var x = 0; x < chunkWitdh; x++) {
		for (var z = 0; z < chunkWitdh; z++) {
			var temperature = biomeNoise1((x)/biomeSpacing, (z)/biomeSpacing)
			var biomerng = Math.round(biomeNoise3((x)/biomeSpacing/10, (z)/biomeSpacing/10)+1)
			var biome = getBiome(x, z, temperature, biomerng)
			for (var y = 0; y < chunkHeight; y++) {
				var rnd = (hash(x+id[0], y, z+id[1]) < 0.2 ? 1 : 0) 
				if (0 < y < 50 && getBlock(x + id[0], y, z + id[1]) == 1 && getBlock(x + id[0], y+1, z + id[1]) == 0 ) {
					if (biome == 'plants' || biome == 'forest') chunk.set(x, y, z, blockIDs.grass)
					else if (biome == 'iceland') chunk.set(x, y, z, blockIDs.grass_snow)
					else if (biome == 'desert') chunk.set(x, y, z, blockIDs.sand)
				}
				else if (getBlock(x + id[0], y+1, z + id[1]) != 0 && getBlock(x + id[0], y, z + id[1]) != blockIDs.water && getBlock(x+id[0], y+3+rnd, z+id[1]) == 0) {
					if (biome == 'plants' || biome == 'forest' || biome == 'iceland') chunk.set(x, y, z, blockIDs.dirt)
					else if (biome == 'desert') chunk.set(x, y, z, blockIDs.sand)
				}
				else if (getBlock(x + id[0], y+1, z + id[1]) == blockIDs.water && getBlock(x + id[0], y, z + id[1]) != 0 && getBlock(x + id[0], y, z + id[1]) != blockIDs.water) {
					chunk.set(x, y, z, blockIDs.gravel)
				}
			}
		}
	}
	return chunk
}
