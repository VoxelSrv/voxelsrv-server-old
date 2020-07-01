var fs = require('fs')
const crunch = require("voxel-crunch")
const ndarray = require('ndarray')


module.exports = { 
	save: saveChunk,
	read: readChunk,
	readData: readChunkData,
	exist: existChunk,
	existData: existChunkData

}


function saveChunk(id, chunk, json) {
	var data = crunch.encode(chunk.data)

	fs.writeFile('./world/chunks/' + id +'.chk', data, function (err) {
		if (err) console.error ('Cant save chunk ' + id + '! Reason: ' + err);
	})

	fs.writeFile('./world/chunks/' + id + '.json', JSON.stringify(json), function (err) {
		if (err) console.error ('Cant save chunk ' + id + '! Reason: ' + err);
	})
}


function readChunk(id) {
	var r = false
	var name = id + '.chk'
	var data = fs.readFileSync('./world/chunks/' + name)
	var array = crunch.decode([...data], new Uint16Array(24*120*24) )
			
	r = new ndarray(array, [24, 120, 24])
	return r
}

function readChunkData(id) {
	var r = false
	var name = id + '.json'
	var data = fs.readFileSync('./world/chunks/' + name)
	r = JSON.parse(data)			
	return r
}

function existChunk(id) {
	var name = id + '.chk'
	var r = fs.existsSync('./world/chunks/' + name)
	return r
}

function existChunkData(id) {
	var name = id + '.json'
	var r = fs.existsSync('./world/chunks/' + name)
	return r
}