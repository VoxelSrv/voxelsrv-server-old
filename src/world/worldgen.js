module.exports = {
	init(seed, blocks) {initWorldGen(seed, blocks)},
	get(x, y, z) {return getBlock(x, y, z)}
}

const { makeNoise2D, makeNoise3D, makeNoise4D } = require('open-simplex-noise')
var hash = require('murmur-numbers')
const { get } = require('../blocks')

var init = false
var blockIDs = {}
var heightNoise, caveNoise, biomeNoise1, biomeNoise2, biomeNoise3, seed, world, plantSeed

var chunkWitdh = 24
var chunkHeight = 120

var waterLevel = 18

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
		
		return Math.floor((dim*30+dim2*20+layer1*20+layer2*10-3)/65) + 15
	}
}
