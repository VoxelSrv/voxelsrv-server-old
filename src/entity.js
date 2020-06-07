var entities = {}

var packet = require('./protocol')
var world = require('./world/main')

module.exports = {
	create(data) { return createEntity(data) },
	delete(id) { deleteEntity(id) },
	update(id, index, data) { updateEntity(id, index, data) },
	data(id, index) { return entities[id][index] },
	move(id, pos) { moveEntity(id, pos) }
}


function createEntity(data) {
	var id

	while (id == null) {
		var tempID = Math.random()*10000 + Object.keys(entities).length
		if (entities[tempID] == undefined) id = tempID
	}
	
	entities[id] = data

	packet.send(-1, 'spawn-entity', {
		id: id,
		data: data
	})
	return id
}



function deleteEntity(id) {
	entities[id] = null
	packet.send(-1, 'despawn-entity', id)

}


function updateEntity(id, index, data) {
	entities[id][index] = data
	packet.send(-1, 'update-entity', {
		id: id,
		index: index,
		data: data
	})
}

function moveEntity(id, pos) {
	entities[id].position = pos
	entities[id].chunk = world.toChunk(pos).id
}