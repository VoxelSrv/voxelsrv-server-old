const EventEmiter = require('events')
const vec = require('gl-vec3')
const event = new EventEmiter()
const entity = require('./entity')
const world = require('./world/main')
const items = require('./items')
const blockIDs = require('./blocks').getIDs()
const blocks = require('./blocks').get()
const protocol = require('./protocol')
const compressChunk = require("voxel-crunch")
const chat = require('./chat')
const command = require('./commands').execute
const hook = require('./hooks')

var cfg = require('../config.json')

var player = {}
var chunksToSend = []


function createPlayer(id, data) {
	var e = entity.create({
		name: data.username,
		nametag: true,
		type: 'player',
		health: 20,
		maxhealth: 20,
		model: 'player',
		texture: 'entity/steve',
		position: [0, 50, 0],
		rotation: 0
	})

	player[id] = {
		id: id,
		nickname: data.username,
		position: cfg.world.spawn,
		rotation: 0,
		chunk: [0, 0],
		loadedchunks: {},
		entity: e,
		inventory: {
			maxslot: 89,
			main: {},
			selected: 0,
			tempslot:{}
		}
	}

	for(var x = 0; x <= player[id].inventory.maxslot; x++) {
		player[id].inventory.main[x] = {}
	}
	event.emit('create', player[id])
}

function movePlayer(id, pos, bool) {
	if (pos != undefined && pos.pos != null) {
		player[id].position = pos.pos
		player[id].chunk = world.toChunk(pos.pos).id
		player[id].rotation = pos.rot
		entity.move(player[id].entity, pos)
		event.emit('move', {id: id, pos: pos.pos, rot: pos.rot})
		if (bool == true) protocol.send(id, 'teleport', pos.pos)
	}
}

function removePlayer(id) {
	event.emit('remove', player[id])
	entity.delete(player[id].entity)
	delete player[id]
}

function getNickname(id) {
	return player[id].nickname
}

// Add item to inventory

function inventoryAdd(eid, item, count, data) {
	event.emit('addItem', player[eid], item, count, data)
	var inventory = player[eid].inventory
	var invItems = Object.entries(inventory.main)
	for (var [slot, data] of invItems) {
		if (data.id == item && (data.count+count) < items.getStack(item) +1) {
			player[eid].inventory.main[slot] = {id: item, count: count+data.count, data: data}
			return true
		}
	}
	for (var [slot, data] of invItems) {
		if (data.id == undefined) {
			player[eid].inventory.main[slot] = {id: item, count: count, data: data}
			return true
		}
	}
	return false	
}

// Removing items from inventory

function inventoryRemove(eid, item, count) {
	event.emit('removeItem', player[eid], item, count)
	var inventory = player[eid].inventory
	var allItems = Object.entries(inventory.main)
	var sel = inventory.selected
	if (inventory.main[sel].id == item) {
		var newcount = inventory.main[sel].count-count
		count = count - inventory.main[sel].count
		if (newcount > 0) inventory.main[sel] = {id: item, count: newcount, data: inventory.main[sel].data}
		else inventory.main[sel] = {}
		if (count <= 0) return true
	}
	for (var [slot, data] of allItems) {
		if (count <= 0) return true
		if (data.id == item) {
			var newcount = data.count-count
			count = count - data.count
			if (newcount > 0) inventory.main[slot] = {id: item, count: newcount, data: data.data}
			else inventory.main[slot] = {}
		}
	}
	return true
}

// Sets slot to item

function inventorySet(eid, slot, item, count, data) {
	event.emit('setSlot', player[eid], slot, item, count, data)
	var inventory = player[eid].inventory
	inventory.main[slot] = {id: item, count: count, data: data}
	return false
}

function inventorySwitch(eid, x, y) {
	event.emit('switchSlots', player[eid], x, y)
	var inventory = player[eid].inventory
	var tempx = inventory.main[x]
	var tempy = inventory.main[y]
	inventory.main[x] = tempy
	inventory.main[y] = tempx
}

// Item movement on LeftClick in inventory

function inventoryLeftClick(eid, x) {
	event.emit('leftClick', player[eid], x)
	var inventory = player[eid].inventory
	if (x >= 0) { // Normal slots
		var tempY = {...inventory.tempslot}
		var tempX = {...inventory.main[x]}
		
		// If tempslot and target slot have the same itemtype
		if (tempY.id == tempX.id &&  tempY.id != undefined ) {
			if ((tempX.count + tempY.count) <=items.getStack(tempX.id) ) {
				var tempZ = {...tempX}
				tempZ.count = tempX.count + tempY.count
				player[eid].inventory.main[x] = tempZ
				player[eid].inventory.tempslot = {}
			} else if ((tempX.count + tempY.count) > items.getStack(tempX.id) ) { 
				var tempZ = {...tempX}
				var tempW = {...tempY}
				tempZ.count = items.getStack(tempX.id)
				tempW.count = tempX.count + tempY.count - items.getStack(tempX.id)
				player[eid].inventory.main[x] = tempZ
				player[eid].inventory.tempslot = tempW
			}
		}
		// If target slot has diffrent itemtype	
		else {
			player[eid].inventory.main[x] = tempY
			player[eid].inventory.tempslot = tempX
		}
	}
	else if (x == -1) { // Bin slot
		var tempy = {...inventory.tempslot}
		var tempx = {...inventory.bin}
		if (tempy.id == undefined) {
			player[eid].inventory.bin = {}
			player[eid].inventory.tempslot = tempx
		}
		else {
			player[eid].inventory.bin = tempy
			player[eid].inventory.tempslot = {}
		}
	}
}

// Inventory rightclick functionality

function inventoryRightClick(eid, x) {
	event.emit('rightClick', player[eid], x)
	var inventory = player[eid].inventory
	// Normal slots
	if (x >= 0) {
		var tempY = {...inventory.tempslot}
		var tempX = {...inventory.main[x]}
		if (tempY.id == undefined) { // Tempslot slot is empty
			var tempZ = {...tempX}
			var tempW = {...tempX}
			tempZ.count = Math.ceil(tempZ.count/2)
			tempW.count = Math.floor(tempW.count/2)
			if (tempW.count <= 0) tempW = {}
			player[eid].inventory.main[x] = {...tempZ}
			player[eid].inventory.tempslot = {...tempW}
		} else if (tempX.id == undefined) { // Target is empty
			var tempZ = {...tempY}
			var tempW = {...tempY}
			tempZ.count = 1
			tempW.count = tempW.count - 1
			if (tempW.count <= 0) tempW = {}
			player[eid].inventory.main[x] = {...tempZ}
			player[eid].inventory.tempslot = {...tempW}
		} else if (tempX.id == tempY.id && tempX.count+1 <= items.getStack(tempX.id)) { // The same itemtype
			var tempZ = {...tempX}
			var tempW = {...tempY}
			tempZ.count = tempZ.count + 1
			tempW.count = tempW.count - 1
			if (tempW.count <= 0) tempW = {}
			player[eid].inventory.main[x] = {...tempZ}
			player[eid].inventory.tempslot = {...tempW}
		}
	}
	// Bin slot (ignored for now)
	else if (x == -1){

	}
}

function inventoryHasItem(eid, item, count) {
	var inventory = player[eid].inventory
	var items = Object.entries(inventory.main)

	for (var [slot, data] of items) {
		if (data.id == item && data.count >= count) return slot
	}
	return -1
}

// Getting player's tool

function getTool(eid) {
	var inventory = player[eid].inventory
	var sel = inventory.selected
	return inventory.main[sel]
}



setInterval(async function() {
	var list = Object.keys(player)

	list.forEach(async function(id) {
		var chunk = player[id].chunk
		var loadedchunks = {...player[id].loadedchunks}
		for (var w = 0; w <= 2; w++) {
			for (var x = 0 - w; x <= 0 + w; x++) {
				for (var z = 0 - w; z <= 0 + w; z++) {
					var tempid = [chunk[0] + x, chunk[1] + z]
					if (loadedchunks[tempid] == undefined) {
						player[id].loadedchunks[tempid] = true
						chunksToSend.push([id, tempid])
					}
					loadedchunks[tempid] = false
				}
			}
		}

		var toRemove = Object.entries(loadedchunks)
		toRemove.forEach(function(item) {
			if (item[1] == true) player[id].loadedchunks[item[0]] = undefined
		})
	})
}, 1000)


setInterval(async function() {
	if (chunksToSend[0] != undefined) {
		sendChunkToPlayer(chunksToSend[0][0], chunksToSend[0][1])
		chunksToSend.shift()
	}
}, 200)

setInterval(async function() {
	var list = Object.keys(player)
	list.forEach(function(id) {
		protocol.send(id, 'inventory-update', {...player[id].inventory})
	})
}, 150)


function sendChunkToPlayer(id, cid) {
	event.emit('sendChunk', player[id], cid)
	world.chunk(cid).then(function(res) {
		if (res != undefined) {
			var chunk = res.data
			protocol.send(id, 'chunkdata', {
				id: cid,
				chunk: compressChunk.encode(chunk)
			})
		}
	})
}

hook.create('player-blockbreak', 5)
hook.create('player-blockplace', 5)
hook.create('player-move', 5)
hook.create('player-inventoryclick', 5)
hook.create('player-chatsend', 5)


const actions = {
	blockbreak(id, data) {
		var action = {id: id, data: data}
		var r = hook.execute('player-blockbreak', action)
		if (r == 1) return

		if (action.data != null || action.data.lenght == 3) {
			var block = world.getBlock(action.data)
			var pos = player[action.id].position
			if (vec.dist(pos, action.data) < 14 && block != undefined && block != 0 && blocks[block].data.unbreakable != true) {
				//player.inv.add(id, blocks[block].data.drop, 1, {})
				world.setBlock(data, 0)
				protocol.sendAll('block-update', {
					id: 0,
					pos: action.data
				})
			}

		}
	},

	blockplace(id, data) {
		var action = {id: id, data: data}
		var r = hook.execute('player-blockplace', action)
		if (r == 1) return

		var inv = player[action.id].inventory
		var item = inv.main[inv.selected]
		var pos = player[action.id].position
		if (vec.dist(pos, action.data) < 14 && item != undefined && item.id != undefined) {
			if (items.get()[item.id].type == 'block' || items.get()[item.id].type == 'block-flat') {
				//player.inv.remove(id, item.id, 1, {})
				world.setBlock(action.data, blockIDs[item.id])
				protocol.sendAll('block-update', {
					id: blockIDs[item.id],
					pos: action.data
				})
			}
		}
	},

	move(id, data) {
		var action = {id: id, data: data}
		var r = hook.execute('player-move', action)
		if (r == 1) return

		var pos = player[action.id].position
		if (vec.dist(pos, action.data.pos) < 20) movePlayer(action.id, action.data)
	},

	inventoryclick(id, data) {
		var action = {id: id, data: data}
		var r = hook.execute('player-inventoryclick', action)
		if (r == 1) return

		if (-2 < action.data.slot < 35) {
			if (action.data.type == 'left') inventoryLeftClick(action.id, action.data.slot)
			else if (action.data.type == 'right') inventoryRightClick(action.id, action.data.slot)
			else if (action.data.type == 'switch') inventorySwitch(action.id, action.data.slot, action.data.slot2)
			else if ( -1 < action.data.slot < 9 && action.data.type == 'select') player[action.id].inventory.selected = action.data.slot
		}
	},

	chatsend(id, data) {
		var action = {id: id, data: data}
		var r = hook.execute('player-chatsend', action)
		if (r == 1) return

		if (action.data.charAt(0) == '/') {
			command(action.id, action.data)
		}
		else if (action.data != '' )chat.send(-2, getNickname(action.id) + " » " + action.data)
	}
}


module.exports = {
	create(id, data) { createPlayer(id, data) },
	remove(id) { removePlayer(id) },
	getName(id) { return getNickname(id) },
	getData(id) { return player[id] },
	move(id, pos, bool) { movePlayer(id, pos, bool) },
	getPos(id) { return player[id].position },
	getIDList() { return Object.keys(player) },
	inv: {
		setSel(id, sel) { player[id].inventory.selected = sel },
		data(id) { return player[id].inventory },
		add(id, item, count, data) { inventoryAdd(id, item, count, data) },
		remove(id, item, count) { inventoryRemove(id, item, count) },
		set(id, slot, item, count, data) { inventorySet(id, slot, item, count, data) },
		hasItem(id, item, count) { return inventoryHasItem(id, item, count) },
		switch(id, x, y) { inventorySwitch(id, x, y) }
	},
	event: event,
	actions: actions
}