const EventEmiter = require('events')
const event = new EventEmiter()

module.exports = {
	init(io) { initProtocol(io) },
	send(id, type, data) { sendPacket(id, type, data) },
	sendAll(type, data) { io.emit(type, data) },
	event: event

}


const illegalCharacters = new RegExp('[^a-zA-Z0-9]')
const player = require('./player')
const chat = require('./chat')
const world = require('./world/main')
const compressChunk = require("voxel-crunch")
const items = require('./items').get()
const blockIDs = require('./blocks').getIDs()
const blocks = require('./blocks').get()
const command = require('./commands').execute
const vec = require('gl-vec3')


var protocol = 1

var cfg = require('../config.json')
const entity = require('./entity')

var connections = {}
var playerCount = 0
var io

function initProtocol(io0) {
	io = io0
	io.on('connection', async function(socket) {
		if (playerCount >= cfg.maxplayers) {
			socket.emit('kick', 'Server is full')
			socket.disconnect(true)
		}

		socket.emit('login-request', {
			name: cfg.name,
			protocol: protocol,
			maxplayers: cfg.maxplayers,
			blocks: blocks,
			blockIDs: blockIDs,
			items: items
		})

		var loginTimeout = true

		socket.on('login', function(data) { 
			loginTimeout = false

			var check = verifyLogin(data)
			if (data.username == '' || data.username == null || data.username == undefined ) data.username = 'Player' + Math.round(Math.random()*10000)
			if (check != 0) {
				socket.emit('kick', check)
				socket.disconnect(true)
			} else {
				var id = socket.id
				player.create(id, data)
				socket.emit('login-success', {pos: cfg.world.spawn, inv: player.inv.data(id) })
				connections[id] = socket

				socket.emit('entity-ignore', player.getData(id).entity)
				Object.entries( entity.getAll() ).forEach(function(data) {
					socket.emit('entity-spawn', {
						id: data[0],
						data: data[1]
					})
				})

				chat.send(-2, player.getName(id) + " joined the game!")
				playerCount = playerCount + 1

				socket.on('disconnect', function() {
					chat.send(-2, player.getName(id) + " left the game!")
					player.remove(id)
					connections[id] = null
					delete connections[id]
					playerCount = playerCount - 1 
				})
				socket.on('chat-send', function(data) {
					if (data.charAt(0) == '/') {
						command(id, data)
					}
					else chat.send(-2, player.getName(id) + " » " + data)
				})
				/*socket.on('chunk-request', async function(id) {
					if (id == null || id == undefined) return
					world.chunk(id).then(function(res) {
						var chunk = res.data
						socket.emit('chunkdata', {
							id: id,
							chunk: compressChunk.encode(chunk)
						})
					})
				})*/
				socket.on('block-break', function(data) {
					if (data != null || data.lenght == 3) {
						var block = world.getBlock(data)
						var pos = player.getPos(id)
						if (vec.dist(pos, data) < 14 && block != undefined && block != 0 && blocks[block].data.unbreakable != true) {
							//player.inv.add(id, blocks[block].data.drop, 1, {})
							world.setBlock(data, 0)
							io.emit('block-update', {
								id: 0,
								pos: data
							})
						}
						else {
							console.log(block, data)
						}

					}
				})

				socket.on('block-place', function(data) {
					var inv = player.inv.data(id)
					var item = inv.main[inv.selected]
					var pos = player.getPos(id)
					if (vec.dist(pos, data) < 14 && item != undefined && item.id != undefined) {
						if (items[item.id].type == 'block' || items[item.id].type == 'block-flat') {
							//player.inv.remove(id, item.id, 1, {})
							world.setBlock(data, blockIDs[item.id])
							io.emit('block-update', {
								id: blockIDs[item.id],
								pos: data
							})
						}
					}
				})

				socket.on('move', function(data) {
					var pos = player.getPos(id)
					if (vec.dist(pos, data.pos) < 20) player.move(id, data)
				})

				socket.on('inventory-click', function(data) {
					if (-2 < data.slot < 35) {
						if (data.type == 'left') player.inv.moveLeft(id, data.slot)
						else if (data.type == 'right') player.inv.moveRight(id, data.slot)
						else if (data.type == 'switch') player.inv.switch(id, data.slot, data.slot2)
						else if ( -1 < data.slot < 9 && data.type == 'select') player.inv.setSel(id, data.slot)
					}
				})

				socket.on('selected', function(data) {
					 
				})

		}
		})

		setTimeout(function() {
			if (loginTimeout == true) { 
				socket.emit('kick', 'Timeout')
				socket.disconnect(true)
			}
		}, 1000)

	})


}

function sendPacket(id, type, data) {
	if (id == -1) io.emit(type, data)
	else if (connections[id] != undefined) connections[id].emit(type, data)
}

function verifyLogin(data) {
	if (data == undefined) return 'No data!'
	else if (data.username == undefined || illegalCharacters.test(data.username)) return 'Illegal username - ' + data.username
	else if (data.protocol == undefined) return 'Illegal protocol'

	return 0
}


