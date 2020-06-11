var fs = require('fs')
const crunch = require("voxel-crunch")
const ndarray = require('ndarray')


module.exports = { 
	save(id, data) { saveChunk(id, data) },
	read: readChunk,
	exist: existChunk
}


function saveChunk(id, chunk) {
	var name = id + '.chk'
	var data = crunch.encode(chunk.data)

	var buffer = Buffer.from(data)

	fs.writeFile('./world/chunks/' + name, buffer, function (err) {
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


function existChunk(id) {
	var name = id + '.chk'
	var r = fs.existsSync('./world/chunks/' + name)
	return r
}