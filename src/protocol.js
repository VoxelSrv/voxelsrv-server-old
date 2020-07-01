const EventEmiter = require('events')
const event = new EventEmiter()

module.exports = {
	init(io) { initProtocol(io) },
	send(id, type, data) { sendPacket(id, type, data) },
	sendAll(type, data) { io.emit(type, data) },
	getSocket(id) { return connections[id] },
	event: event

}


const illegalCharacters = new RegExp('[^a-zA-Z0-9]')
const player = require('./player')
const chat = require('./chat')
const items = require('./items').get()
const blockIDs = require('./blocks').getIDs()
const blocks = require('./blocks').get()
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
				player.event.emit('connection', id)
				player.create(id, data)
				socket.emit('login-success', {
					pos: cfg.world.spawn,
					inv: player.inv.data(id),
					clientSideBlockPrediction: true,
					blocks: blocks,
					blockIDs: blockIDs,
					items: items
				})
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
					player.event.emit('disconnect', id)
					chat.send(-2, player.getName(id) + " left the game!")
					player.remove(id)
					connections[id] = null
					delete connections[id]
					playerCount = playerCount - 1 
				})
				socket.on('chat-send', function(data) {
					player.actions.chatsend(id, data)
				})

				socket.on('block-break', function(data) {
					player.actions.blockbreak(id, data)
				})

				socket.on('block-place', function(data) {
					player.actions.blockplace(id, data)
				})

				socket.on('move', function(data) {
					player.actions.move(id, data)

				})

				socket.on('inventory-click', function(data) {
					player.actions.inventoryclick(id, data)
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
	else if (data.protocol == undefined || data.protocol != protocol) return 'Unsupported protocol'

	return 0
}


