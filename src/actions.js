
module.exports = {
	init: init,
	wss: wsg
}

const EventEmitter = require('events')

const illegalCharacters = new RegExp('[^a-zA-Z0-9]')
const players = require('./player')
const items = require('./items').get()
const blockIDs = require('./blocks').getIDs()
const blocks = require('./blocks').get()
const console = require('./console')
const protocol = require('./protocol')

var protocolVer = 2

var cfg = require('../config.json')
const entity = require('./entity')

var connections = {}
var playerCount = 0

var wsg 

function packet(type, data) {
	return protocol.parseToMessage('server', type, data)
}

function init(wss) {
	wsg = wss

	function sendChat(id, msg) {
		if (id == '#console') console.log(msg)
		else if (id == '#all') {
			console.chat(msg)
			wss.clients.forEach(function each(client) {
				if (client.readyState === WebSocket.OPEN) {
					client.send( packet('chatMessage', { message: msg }) )
				}
			})
		}
		else ( players.get('id') ).send(msg)
	}

	wss.on('connection', async function(socket) {
		if (playerCount >= cfg.maxplayers) {
			socket.send( packet('playerKick', { reason: 'Server is full' }) )
			socket.destroy()
		}

		var packetEvent = new EventEmitter()
		socket.on('message', (m) => {
			var packet = protocol.parseToObject('client', m)
			packetEvent.emit(packet.type, packetEvent.data)
		})

		function send(type, data) {
			socket.send( packet(type, data) )
		}

		send('loginRequest', {
			name: cfg.name,
			protocol: protocolVer,
			maxplayers: cfg.maxplayers
		})

		var loginTimeout = true

		packetEvent.on('loginResponse', function(data) { 
			loginTimeout = false

			var check = verifyLogin(data)
			if (data.username == '' || data.username == null || data.username == undefined ) data.username = 'Player' + Math.round(Math.random()*100000)

			var id = data.username.toLowerCase()

			if (check != 0) {
				packetEvent('playerKick', { reason: check })
				socket.destroy()
				delete packetEvent
			} if (connections[id] != undefined) {
				send('playerKick', { reason: 'Player with that nickname is already online!' })
				socket.destroy()
				delete packetEvent
			} else {
				players.event.emit('connection', id)
				var player = players.create(id, data, socket, packetEvent)

				send('loginSuccess', {
					xPos: player.entity.data.position[0],
					yPos: player.entity.data.position[1],
					zPos: player.entity.data.position[2],
					inventory: JSON.stringify(player.inventory),
					blocksDef: JSON.stringify(blocks),
					blockIDs: JSON.stringify(blockIDsDef),
					items: JSON.stringify(items)
				})
				connections[id] = socket

				send('playerEntity', { uuid: player.entity.id })

				Object.entries( entity.getAll(player.world) ).forEach(function(data) {
					socket.emit('entityCreate', {
						uuid: data[0],
						data: JSON.stringify(data[1].data)
					})
				})

				sendChat('#all', player.nickname + " joined the game!")
				playerCount = playerCount + 1

				socket.on('close', function() {
					players.event.emit('disconnect', id)
					sendChat('#all', player.nickname + " left the game!")
					player.remove()
					delete connections[id]
					delete packetEvent
					playerCount = playerCount - 1 
				})
				packetEvent.on('actionMessage', function(data) {
					player.action_chatsend(data.message)
				})

				packetEvent.on('actionBlockBreak', function(data) {
					player.action_blockbreak([data.x, data.y, data.z])
				})

				packetEvent.on('actionBlockPlace', function(data) {
					player.action_blockplace([data.x, data.y, data.z])
				})

				packetEvent.on('actionMove', function(data) {
					player.action_move({ pos: [data.x, data.y, data.z], rot: data.rotation })
				})

				packetEvent.on('actionInventoryClick', function(data) {
					player.action_invclick(data)
				})

		}
		})

		setTimeout(function() {
			if (loginTimeout == true) { 
				send('playerKick', { reason: 'Timeout'})
				socket.destroy()
				delete packetEvent

			}
		}, 10000)

	})


}

function verifyLogin(data) {
	if (data == undefined) return 'No data!'
	else if (data.username == undefined || illegalCharacters.test(data.username)) return 'Illegal username - ' + data.username
	else if (data.protocol == undefined || data.protocol != protocol) return 'Unsupported protocol'

	return 0
}


