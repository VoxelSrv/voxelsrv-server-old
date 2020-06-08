var entities = {}

var packet = require('./protocol')
var world = require('./world/main')
const { sendAll } = require('./chat')

module.exports = {
	create(data) { return createEntity(data) },
	delete(id) { deleteEntity(id) },
	update(id, index, data) { updateEntity(id, index, data) },
	data(id, index) { return entities[id][index] },
	move(id, pos) { moveEntity(id, pos) },
	getAll() { return entities }
}


function createEntity(data) {
	var id

	while (id == null) {
		var tempID = Math.round(Math.random()*10000 + Object.keys(entities).length)
		if (entities[tempID] == undefined) id = tempID
	}
	
	entities[id] = data

	packet.sendAll('entity-spawn', {
		id: id,
		data: data
	})
	return id
}


function deleteEntity(id) {
	delete entities[id]
	packet.sendAll('entity-despawn', id)
}


function updateEntity(id, index, data) {
	entities[id][index] = data
	packet.sendAll('entity-update', {id: id, index: index, data: data})
}

function moveEntity(id, pos) {
	entities[id].position = pos.pos
	entities[id].chunk = world.toChunk(pos.pos).id
	entities[id].rotation = pos.rot
	packet.sendAll('entity-move', {id: id, data: pos})

}