const illegalCharacers = new RegExp('[^a-zA-Z0-9]')
const player = require('./player')
var connections = {}

function initProtocol(io) {
	io.on('connection', function(socket) {
		if (player.lenght() >= cfg.maxplayers) {
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
				io.emit('chat', player.getName(id) + " joined the game!")
				console.log(player.getName(id) + " joined the game!")
				socket.on('disconnect', function() {
					io.emit('chat', player.getName(id) + " left the game!")
					console.log(player.getName(id) + " left the game!")
					player.remove(id)
					connections[id] = null
				})
				socket.on('chat-send', function(data) {

				})
		}
		})

		setTimeout(function() {
			if (loginTimeout == true) { 
				socket.emit('kick', 'Timeout')
				socket.disconnect(true)
			}
		}, 10000)

	})


}

function sendPacket(id, type, data) {
	connections[id].emit(type, data)
}

function verifyLogin(data) {
	if (data == undefined) return 'No data!'
	else if (data.username == undefined || illegalCharacters.test(data.username)) return 'Illegal username'
	else if (data.protocol == undefined) return 'Illegal protocol'

	return 0
}


module.exports = {
	init(io) { initProtocol(io) },
	send(id, type, data) { sendPacket(id, type, data) } 
}