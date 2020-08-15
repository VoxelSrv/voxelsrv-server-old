const EventEmiter = require('events')
const vec = require('gl-vec3')
const event = new EventEmiter()
const entity = require('./entity')
const worldManager = require('./worlds')
const items = require('./items').registry
const blockIDs = require('./blocks').getIDs()
const blocks = require('./blocks').get()
const compressChunk = require("voxel-crunch")
const commands = require('./commands')
const hook = require('./hooks')
const fs = require('fs')
const console = require('./console')
const protocol = require('./protocol')
const prothelper = require('./protocol-helper')

const { PlayerInventory } = require('./inventory')

let cfg = require('../config.json')

var players = {}
var chunksToSend = []

commands.setPlayer(players)

function sendChat(id, msg) {
	if (id == '#console') console.log(msg)
	else if (id == '#all') {
		console.chat(msg)
		prothelper.broadcast('chatMessage', { message: msg })

	}
	else if (players[id] != undefined) players[id].send(msg)
}


function createPlayer(id, data, socket, packetEvent) {
	players[id] = new Player(id, data.username, socket, packetEvent)

	event.emit('create', players[id])

	return players[id]
}


function readPlayer(id) {
	try {
		var r = false
		var name = id + '.json'
		var data = fs.readFileSync('./players/' + name)
		r = JSON.parse(data)

		return r
	} catch(e) {
		console.error('Tried to load data of player ' + id + ', but it failed! Error: ', e)
	}
	
}

function existPlayer(id) {
	var name = id + '.json'
	var r = fs.existsSync('./players/' + name)
	return r
}

function savePlayer(id, data) {
	fs.writeFile('./players/' + id +'.json', JSON.stringify(data), function (err) {
		if (err) console.error ('Cant save player ' + id + '! Reason: ' + err);
	})
}

class Player {
	constructor(id, name, socket, packetEvent) {
		this.id = id
		this.nickname = name
		if ( existPlayer(this.id) ) var data = readPlayer(this.id)
		
		if (data == undefined) {
			this.entity = entity.create({
				name: name,
				nametag: true,
				type: 'player',
				health: 20,
				maxhealth: 20,
				model: 'player',
				texture: 'entity/steve',
				position: cfg.world.spawn,
				rotation: 0,
				hitbox: [0.55, 1.9, 0.55]

			}, 'default')
	
			this.world = 'default'
	
			this.inventory = new PlayerInventory(10)
		} else {
			this.entity = entity.recreate(data.entity.id, {
				name: data.entity.data.name,
				nametag: data.entity.data.nametag,
				type: 'player',
				health: data.entity.data.health,
				maxhealth: data.entity.data.maxhealth,
				model: 'player',
				texture: 'entity/steve',
				position: data.entity.data.position,
				rotation: data.entity.data.rotation,
				hitbox: [0.55, 1.9, 0.55]
			}, data.world)

			this.world = data.world

			this.inventory = new PlayerInventory(10, data.inventory)
		}
		
		this.socket = socket
		this.packetRecived = packetEvent
		this.chunks = {}
		savePlayer(this.id, this.getObject())
		
		this.inventory.event.on('slot-update', (data) => {
			this.sendPacket('playerSlotUpdate', { slot: parseInt(data.slot), data: JSON.stringify(data.data), type: data.type })
		}) 
	}

	getObject() {
		return {
			id: this.id,
			nickname: this.nickname,
			entity: this.entity.getObject(),
			inventory: this.inventory.getObject(),
			world: this.world
		}
	}

	sendPacket(type, data) {
		this.socket.send( protocol.parseToMessage('server', type, data) )
	}

	remove() {
		savePlayer(this.id, this.getObject())
		this.entity.remove()

		setTimeout(() => { delete players[this.id] }, 10 )
		
	}

	teleport(pos, eworld) {
		this.entity.teleport(pos, eworld)
		this.sendPacket('playerTeleport', {x: pos[0], y: pos[1], z: pos[2] })
	}

	move(pos) {
		event.emit('player-move', {id: this.id, pos: pos})
		this.entity.move(pos)
	}

	send(msg) {
		this.sendPacket('chatMessage', {message: msg})
	}

	rotate(rot) {
		event.emit('player-rotate', {id: this.id, rot: rot})
		this.entity.rotate(rot)
	}
	
	get getID() {
		return this.id
	}

	action_blockbreak(data) {
		var action = {id: this.id, data: data}
		var r = hook.execute('player-blockbreak', action)
		if (r == 1) return

		if (action.data != null || action.data.lenght == 3) {
			if ( Math.abs(action.data[0]) >= 120000 || Math.abs(action.data) >= 120000) {
				return
			}

			var block = worldManager.get(this.world).getBlock(action.data)
			var pos = this.entity.data.position

			if (vec.dist(pos, action.data) < 14 && block != undefined && block != 0 && blocks[block].data.unbreakable != true) {
				//player.inv.add(id, blocks[block].data.drop, 1, {})
				worldManager.get(this.world).setBlock(data, 0)
				prothelper.broadcast('worldBlockUpdate', {
					id: 0,
					x: action.data[0],
					y: action.data[1],
					z: action.data[2]
				})
			}

		}
	}

	action_blockplace(data) {
		var action = {id: this.id, data: data}
		var r = hook.execute('player-blockplace', action)
		if (r == 1) return


		var inv = this.inventory
		var item = inv.main[inv.selected]
		var pos = this.entity.data.position

		if (vec.dist(pos, action.data) < 14 && item != undefined && item.id != undefined) {
			if (items[item.id].type == 'block' || items[item.id].type == 'block-flat') {
				//player.inv.remove(id, item.id, 1, {})
				worldManager.get(this.world).setBlock(action.data, blockIDs[item.id])
				prothelper.broadcast('worldBlockUpdate', {
					id: blockIDs[item.id],
					x: action.data[0],
					y: action.data[1],
					z: action.data[2]
				})
			}
		}
	}

	action_invclick(data) {
		if (data.inventory == undefined) data.inventory = this.inventory
		var action = {id: this.id, data: data}
		var r = hook.execute('player-inventoryclick', action)
		if (r == 1) return

		if (-2 < action.data.slot < 35) {
			if (action.data.type == 'left') this.inventory.action_left(action.data.inventory, action.data.slot)
			else if (action.data.type == 'right')  this.inventory.action_right(action.data.inventory, action.data.slot)
			else if (action.data.type == 'switch')  this.inventory.action_switch(action.data.slot, action.data.slot2)
			else if ( -1 < action.data.slot < 9 && action.data.type == 'select')  this.inventory.select(action.data.slot)
		}
	}


	action_chatsend(data) {
		var action = {id: this.id, data: data}
		var r = hook.execute('player-chatsend', action)
		if (r == 1) return

		if (action.data.charAt(0) == '/') {
			commands.execute(this.id, action.data)
		}
		else if (action.data != '' ) sendChat('#all', this.nickname + " » " + action.data)
	}

	action_move(data) {
		var action = {id: this.id, data: data}
		var r = hook.execute('player-move', action)
		if (r == 1) return

		var pos = this.entity.data.position
		if ( Math.abs(action.data.pos[0]) > 120000 || Math.abs(action.data.pos[2]) > 120000) {
			this.sendPacket('playerTeleport', { x: pos[0], y: pos[1], z: pos[2] })
			return
		}
		if (vec.dist(pos, action.data.pos) < 20) this.move(action.data.pos)

		this.rotate(action.data.rot)
	}
}


setInterval(async function() {
	var list = Object.keys(players)

	var viewDistance = 3

	list.forEach(async function(id) {
		var chunk = players[id].entity.chunk
		var loadedchunks = {...players[id].chunks}
		for (var w = 0; w <= viewDistance; w++) {
			for (var x = 0 - w; x <= 0 + w; x++) {
				for (var z = 0 - w; z <= 0 + w; z++) {
					var tempid = [chunk[0] + x, chunk[1] + z]
					if (loadedchunks[tempid] == undefined) {
						players[id].chunks[tempid] = true
						chunksToSend.push([id, tempid])
					}
					if (worldManager.get(players[id].world).chunks[tempid] != undefined) worldManager.get(players[id].world).chunks[tempid].keepAlive()
					loadedchunks[tempid] = false
				}
			}
		}

		var toRemove = Object.entries(loadedchunks)
		toRemove.forEach(function(item) {
			if (item[1] == true) delete players[id].chunks[item[0]]
		})
	})
}, 1000)


setInterval(async function() {
	if (chunksToSend[0] != undefined) {
		sendChunkToPlayer(chunksToSend[0][0], chunksToSend[0][1])
		chunksToSend.shift()
	}
}, 100)

/* setInterval(async function() {
	var list = Object.values(players)
	list.forEach(function(player) {
		if (player.inventory.updated != true) {
			player.inventory.updated = true
			player.sendPacket('playerInventory', { inventory: JSON.stringify ({...player.inventory}) })
		}
	})
}, 50) */


function sendChunkToPlayer(id, cid) {
	event.emit('sendChunk', id, cid)
	if (players[id] != undefined) {
		worldManager.get(players[id].world).getChunk(cid, true).then(function(chunk) {
			if (chunk != undefined && players[id] != undefined) {
				chunk.keepAlive()
				players[id].sendPacket('worldChunk', {
					x: cid[0],
					z: cid[1],
					data: compressChunk.encode(chunk.data.data)
				})
			}
		})
	}
}

hook.create('player-blockbreak', 5)
hook.create('player-blockplace', 5)
hook.create('player-move', 5)
hook.create('player-inventoryclick', 5)
hook.create('player-chatsend', 5)


module.exports = {
	create: createPlayer,
	get(id) { return players[id] },
	getAll() { return players },
	setIO(io2) { io = io2 },
	event: event
}