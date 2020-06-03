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

var protocol = 1

var cfg = require('../config.json')

var connections = {}
var playerCount = 0
var io

function initProtocol(io0) {
	io = io0
	io.on('connection', function(socket) {
		if (playerCount >= cfg.maxplayers) {
			socket.emit('kick', 'Server is full')
			socket.disconnect(true)
		}

		socket.emit('login-request', {
			name: cfg.name,
			protocol: protocol,
			maxplayers: cfg.maxplayers
		})

		var loginTimeout = true

		socket.on('login', function(data) { 
			loginTimeout = false

			var check = verifyLogin(data)
			if (check != 0) {
				socket.emit('kick', check)
				socket.disconnect(true)
			} else {
				var id = socket.id
				player.create(id, data)
				connections[id] = socket
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
					chat.send(-2, player.getName(id) + " » " + data)
				})
				socket.on('chunk-request', async function(id) {
					if (id == null || id == undefined) return
					world.chunk(id).then(function(res) {
						var chunk = res.data
						socket.emit('chunkdata', {
							id: id,
							chunk: chunk.data
						})
					})
				})
				socket.on('block-break', function(data) {
					console.log(data)
					world.setBlock(data, 0)
					io.emit('block-update', {
						id: 0,
						pos: data
					})
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
	connections[id].emit(type, data)
}

function verifyLogin(data) {
	if (data == undefined) return 'No data!'
	else if (data.username == undefined || illegalCharacters.test(data.username)) return 'Illegal username - ' + data.username
	else if (data.protocol == undefined) return 'Illegal protocol'

	return 0
}


