var packet = require('./protocol')
var worldManager = require('./worlds')

const uuid = require('uuid').v4;


function createEntity(data, worldName) {
	var id = uuid()

	worldManager.get(worldName).entities[id] = new Entity(id, data, worldName)

	packet.sendAll('entity-spawn', { id: id, data: worldManager.get(worldName).entities[id].data })

	return worldManager.get(worldName).entities[id]
}

function recreateEntity(id, data, worldName) {
	
	worldManager.get(worldName).entities[id] = new Entity(id, data)

	packet.sendAll('entity-spawn', { id: id, data: worldManager.get(worldName).entities[id].data })

	return worldManager.get(worldName).entities[id]
}

class Entity {
	constructor(id, data, world, tick) {
		this.data = data
		if (data.position == undefined) {
			this.data.position = [0, 0, 0]
		} if (data.rotation == undefined) {
			this.data.rotation = 0
		}
		this.id = id
		this.world = world
		this.chunk = worldManager.toChunk(this.data.position).id
		if (tick instanceof Function) this.tick = tick
		else this.tick = function() {}
	}

	getObject() {
		return {
			id: this.id,
			data: this.data,
			chunk: this.chunk
		}
	}

	teleport(pos, eworld) {
		this.world = eworld
		this.data.position = pos
		this.chunk = worldManager.toChunk(pos).id
		packet.sendAll('entity-move', {id: this.id, data: { pos: this.data.position, rot: this.data.rotation } }) 
	}

	move(pos) {
		this.data.position = pos
		this.chunk = worldManager.toChunk(pos).id
		packet.sendAll('entity-move', {id: this.id, data: { pos: this.data.position, rot: this.data.rotation } }) 

	}

	rotate(rot) {
		this.data.rotation = rot
		packet.sendAll('entity-move', {id: this.id, data: { pos: this.data.position, rot: this.data.rotation } }) 
	}
	
	remove() {
		try {
			var id = this.id
			packet.sendAll('entity-despawn', id)

			if (this.data.type != 'player') {
				var world = worldManager.get(this.world)
				if (world.entities[id] != undefined) delete world.entities[id]
			}
		} catch(e) {
			console.log('Server tried to remove entity, but it didn\'t work! Error: ', e)
		}
	}

	getID() {
		return this.id
	}
}



module.exports = {
	create: createEntity,
	recreate: recreateEntity,
	get(world, id) { return worldManager.get(world).entities[id] },
	getAll(world) { return worldManager.get(world).entities }
}
