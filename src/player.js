const EventEmiter = require('events')
const event = new EventEmiter()
const entity = require('./entity')
const world = require('./world/main')
const items = require('./items')
const protocol = require('./protocol')
const compressChunk = require("voxel-crunch")
const { getPackedSettings } = require('http2')


module.exports = {
	create(id, data) { createPlayer(id, data) },
	remove(id) { removePlayer(id) },
	getName(id) { return getNickname(id) },
	getData(id) { return player[id] },
	move(id, pos) { movePlayer(id, pos) },
	inv: {
		setSel(id, sel) { player[id].inventory.selected = sel },
		data(id) { return player[id].inventory },
		add(id, item, count, data) { inventoryAdd(id, item, count, data) },
		remove(id, item, count) { inventoryRemove(id, item, count) },
		set(id, slot, item, count, data) { inventorySet(id, item, count) },
		hasItem(id, item, count) { return inventoryHasItem(id, item, count) },
		moveLeft(id, x) { inventoryLeftClick(id, x) },
		moveRight(id, x) { inventoryRightClick(id, x) },
		switch(id, x, y) { inventorySwitch(id, x, y) }
	},
	event: event
}

var player = {}
var chunksToSend = []

function createPlayer(id, data) {
	var e = entity.create({
		name: data.username,
		type: 'player',
		health: 20,
		maxhealth: 20,
		model: 'human',
		position: [0, 50, 0],
		rotation: 0
	})

	player[id] = {
		id: id,
		nickname: data.username,
		position: [0, 100, 0],
		rotation: 0,
		chunk: [0, 0],
		loadedchunks: {},
		entity: e,
		inventory: {
			maxslot: 35,
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

function movePlayer(id, pos) {
	if (pos.pos != null) {
		player[id].position = pos.pos
		player[id].chunk = world.toChunk(pos.pos).id
		player[id].rotation = pos.rot
		entity.move(player[id].entity, pos)
		event.emit('move', {id: id, pos: pos.pos, rot: pos.rot})
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
	var inventory = player[eid].inventory
	inventory.main[slot] = {id: item, count: count, data: data}
	return false
}

function inventorySwitch(eid, x, y) {
	var inventory = player[eid].inventory
	var tempx = inventory.main[x]
	var tempy = inventory.main[y]
	inventory.main[x] = tempy
	inventory.main[y] = tempx
}

// Item movement on LeftClick in inventory

function inventoryLeftClick(eid, x) {
	var inventory = player[eid].inventory
	if (x >= 0) { // Normal slots
		var tempY = {...inventory.tempslot}
		var tempX = {...inventory.main[x]}
		
		// If tempslot and target slot have the same itemtype
		if (tempY.id == tempX.id &&  tempY.id != undefined ) {
			if ((tempX.count + tempY.count) <= getItemMaxStack(tempX.id) ) {
				var tempZ = {...tempX}
				tempZ.count = tempX.count + tempY.count
				player[eid].inventory.main[x] = tempZ
				player[eid].inventory.tempslot = {}
			} else if ((tempX.count + tempY.count) > getItemMaxStack(tempX.id) ) { 
				var tempZ = {...tempX}
				var tempW = {...tempY}
				tempZ.count = getItemMaxStack(TempX.id)
				tempW.count = tempX.count + tempY.count - getItemMaxStack(tempX.id)
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
		} else if (tempX.id == tempY.id && tempX.count+1 <= getItemMaxStack(tempX.id)) { // The same itemtype
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
		for (var x = -2; x <= 2; x++) {
			for (var z = -2; z <= 2; z++) {
				var tempid = [chunk[0] + x, chunk[1] + z]
				if (loadedchunks[tempid] == undefined) {
					player[id].loadedchunks[tempid] = true
					chunksToSend.push([id, tempid])
				}
				loadedchunks[tempid] = false
			}
		}

		var toRemove = Object.entries(loadedchunks)
		toRemove.forEach(function(item) {
			if (item[1] == true) player[id].loadedchunks[item[0]] = undefined
		})
	})
}, 500)


setInterval(async function() {
	if (chunksToSend[0] != undefined) {
		sendChunkToPlayer(chunksToSend[0][0], chunksToSend[0][1])
		chunksToSend.shift()
	}
}, 50)

setInterval(async function() {
	var list = Object.keys(player)
	list.forEach(function(id) {
		protocol.send(id, 'inventory-update', {...player[id].inventory})
	})
}, 100)


function sendChunkToPlayer(id, cid) {
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