var worldManager = require('./worlds')
const protocol = require('./protocol')
const prothelper = require('./protocol-helper')

const uuid = require('uuid').v4;


function createEntity(data, worldName) {
	var id = uuid()

	worldManager.get(worldName).entities[id] = new Entity(id, data, worldName)

	prothelper.broadcast('entityCreate', { uuid: id, data: JSON.stringify(worldManager.get(worldName).entities[id].data) })

	return worldManager.get(worldName).entities[id]
}

function recreateEntity(id, data, worldName) {
	
	worldManager.get(worldName).entities[id] = new Entity(id, data)

	prothelper.broadcast('entityCreate', { uuid: id, data: JSON.stringify(worldManager.get(worldName).entities[id].data) })

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
		prothelper.broadcast('entityMove', { uuid: id, x: this.data.position[0], y: this.data.position[1], z: this.data.position[2], rotation: this.data.rotation })

	}

	move(pos) {
		this.data.position = pos
		this.chunk = worldManager.toChunk(pos).id
		prothelper.broadcast('entityMove', { uuid: this.id, x: this.data.position[0], y: this.data.position[1], z: this.data.position[2], rotation: this.data.rotation })

	}

	rotate(rot) {
		this.data.rotation = rot
		prothelper.broadcast('entityMove', { uuid: this.id, x: this.data.position[0], y: this.data.position[1], z: this.data.position[2], rotation: this.data.rotation })
	}
	
	remove() {
		try {
			var id = this.id
			prothelper.broadcast('entityRemove', { uuid: this.id })

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
	getAll(world) { return worldManager.get(world).entities },
	setIO(io2) { wss = io2 }
}
