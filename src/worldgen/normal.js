
const { makeNoise2D, makeNoise3D } = require('open-simplex-noise')
const tree = require('./parts/tree')
var hash = require('murmur-numbers')

function getHighestBlock(chunk, x, z) {
	for (var y = 120 - 1; y >= 0; y = y - 1) {
		var val = chunk.get(x, y, z)
		if (val != 0) return {level: y, block: val}
	}
	return null
}


module.exports = class {
	constructor(seed, blocks) {
		this.name = 'normal'
		this.blockIDs = blocks
		this.seed = seed
		this.heightNoise = makeNoise2D(Math.round(seed * Math.sin(seed^1) * 10000))
		this.caveNoise = makeNoise3D(Math.round(seed * Math.sin(seed^2) * 10000))
		this.biomeNoise1 = makeNoise2D(Math.round(seed * Math.sin(seed^3) * 10000))
		this.biomeNoise2 = makeNoise2D(Math.round(seed * Math.sin(seed^4) * 10000))
		this.biomeNoise3 = makeNoise2D(Math.round(seed * Math.sin(seed^5) * 10000))
		this.plantSeed = Math.round(seed * Math.sin(seed^6) * 10000) 

		this.biomeSpacing = 100 // Size of biomes

		this.chunkWitdh = 24
		this.chunkHeight = 120
		this.waterLevel = 40
	}

	getBlock(x, y, z) {
		var m = this.biomeNoise2((x)/180, (z)/180)
		var r = this.getHeightMap(x, y, z, m)
		if (y <= r) return this.blockIDs.stone
		else if (y <= this.waterLevel) return this.blockIDs.water
		else return 0
	}


	getHeightMap(x, y, z, mountaines) {
		var dim = (this.caveNoise(x/180, y/180, z/180)+0.3)*140
		var dim2 = (this.caveNoise(x/20, y/20, z/20))*50
		var layer1 = this.heightNoise(x/140, z/140)*mountaines*20
		var layer2 = this.heightNoise(x/40, z/40)*20
			
		return Math.floor((dim*30+dim2*20+layer1*20+layer2*10-3)/65) + 30
	}

	getBiome(x, z, temperature, biomerng) {
		if (0.2 < temperature && biomerng == 1) return 'desert'
		else if ( -1 < temperature < -0.2 && biomerng == 1) return 'iceland'
		else if ( -0.3 < temperature < 0.3 && biomerng == 2) return 'forest'
		else return 'plants'
	}

	generateChunk(id, chunk) {
		var xoff = id[0]*this.chunkWitdh
		var zoff = id[1]*this.chunkWitdh

		for (var x = 0; x < this.chunkWitdh; x++) {
			for (var z = 0; z < this.chunkWitdh; z++) {
				for (var y = 0; y < this.chunkHeight; y++) {
					var block = this.getBlock(x+xoff, y, z+zoff)
					var biome = 'plants'
					if (block != 0) {
						if (0 < y < 50 && this.getBlock(x+xoff, y, z+zoff) == 1 && this.getBlock(x+xoff, y+1, z+zoff) == 0 ) {
							if (biome == 'plants' || biome == 'forest') chunk.set(x, y, z, this.blockIDs.grass)
							else if (biome == 'iceland') chunk.set(x, y, z, this.blockIDs.grass_snow)
							else if (biome == 'desert') chunk.set(x, y, z, this.blockIDs.sand)
						}
						else if (this.getBlock(x+xoff, y+1, z+zoff) != 0 && this.getBlock(x+xoff, y, z+zoff) != this.blockIDs.water && this.getBlock(x+xoff, y+3, z+zoff) == 0) {
							if (biome == 'plants' || biome == 'forest' || biome == 'iceland') chunk.set(x, y, z, this.blockIDs.dirt)
							else if (biome == 'desert') chunk.set(x, y, z, this.blockIDs.sand)
						}
						else if (this.getBlock(x+xoff, y+1, z+zoff) == this.blockIDs.water && this.getBlock(x+xoff, y, z+zoff) != 0 && this.getBlock(x+xoff, y, z+zoff) != this.blockIDs.water) {
							chunk.set(x, y, z, this.blockIDs.gravel)
						}
						else chunk.set(x, y, z, block)
					}
				}
			}
		}

		
		for (var x = 0; x < chunk.shape[0]; x++) {
			for (var z = 0; z < chunk.shape[2]; z++) {
				if ( hash( (x+xoff), (z+zoff), this.plantSeed) < 0.1 ) {
					var high = {...getHighestBlock(chunk, x, z)}
					if (high.block == this.blockIDs.grass) {
						chunk.set(x, high.level+1, z, this.blockIDs.grass_plant)
					}
				}
				else if ( hash( (x+xoff), (z+zoff), this.plantSeed*2) < 0.1 ) {
					var high = {...getHighestBlock(chunk, x, z)}
					if (high.block == this.blockIDs.grass) {
						chunk.set(x, high.level+1, z, ( ( hash( x+xoff, y, z+zoff, this.plantSeed) <= 0.5 ) ? this.blockIDs.red_flower : this.blockIDs.yellow_flower ) )
					}
				}
				else if ( 5 < x && x < 17 && 5 < z && z < 17) { //Temp
					if ( hash( (x+xoff), (z+zoff), this.seed) < 0.02 ) {
						var high = {...getHighestBlock(chunk, x, z)}
						if (high.block == this.blockIDs.grass) {
							var gen = tree.oakTree( hash( (x+xoff), (z+zoff), this.seed)*1000 )
							this.pasteStructure(chunk, gen, x, high.level + 1, z)
						}
					} else if ( hash( (x+xoff), (z+zoff), this.seed*5) < 0.007 ) {
						var high = {...getHighestBlock(chunk, x, z)}
						if (high.block == this.blockIDs.grass) {
							var gen = tree.birchTree( hash( (x+xoff), (z+zoff), this.seed)*5834 )
							this.pasteStructure(chunk, gen, x, high.level + 1, z)
						}
					}
				}
			}
		}

		
		return chunk

	}


	pasteStructure(chunk, gen, x, y, z) {
		var xm = Math.round(gen.shape[0]/2)
		var zm = Math.round(gen.shape[2]/2)

		for (var i = 0; i < gen.shape[0]; i++) {
			for (var j = 0; j < gen.shape[1]; j++) {
				for (var k = 0; k < gen.shape[2]; k++) {
					if (gen.get(i, j, k) != 0) { 
						chunk.set(x-xm+i, y+j, z-zm+k, gen.get(i, j, k) ) 
					}
				}
			}
		}
	}

}