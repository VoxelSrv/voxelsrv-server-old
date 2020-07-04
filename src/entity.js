var entities = {}

var packet = require('./protocol')
var world = require('./world/main')

module.exports = {
	create(data) { return createEntity(data) },
	get(id) { return entities[id] },
	getAll() { return entities }
}


function createEntity(data) {
	var id

	while (id == null) {
		var tempID = Math.round(Math.random()*10000000 + Object.keys(entities).length)
		if (entities[tempID] == undefined) id = tempID
	}

	entities[id] = new Entity(id, data, 'world')

	packet.sendAll('entity-spawn', { id: id, data: entities[id].data })

	return entities[id]
}



class Entity {
	constructor(id, data, entityWorld, tick) {
		this.data = data
		if (data.position == undefined) {
			this.data.position = [0, 0, 0]
		} if (data.rotation == undefined) {
			this.data.rotation = 0
		}
		this.id = id
		this.chunk = world.toChunk(this.data.position).id
		this.world = entityWorld
		if (tick instanceof Function) this.tick = tick
		else this.tick = function() {}
	}

	teleport(pos, eworld) {
		this.world = eworld
		this.data.position = pos
		this.chunk = world.toChunk(pos).id
		packet.sendAll('entity-move', {id: this.id, data: { pos: this.data.position, rot: this.data.rotation } }) 
	}

	move(pos) {
		this.data.position = pos
		this.chunk = world.toChunk(pos).id
		packet.sendAll('entity-move', {id: this.id, data: { pos: this.data.position, rot: this.data.rotation } }) 

	}

	rotate(rot) {
		this.data.rotation = rot
		packet.sendAll('entity-move', {id: this.id, data: { pos: this.data.position, rot: this.data.rotation } }) 
	}
	
	remove() {
		packet.sendAll('entity-despawn', this.id)
		delete entities[this.id]
	}

	getID() {
		return this.id
	}
}
