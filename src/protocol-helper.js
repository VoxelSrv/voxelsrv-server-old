let wss = null
const WebSocket = require('ws')
const protocol = require('./protocol')

module.exports = {
	setWS(ws2) {wss = ws2},
	broadcast(type, data) {
		if (wss == null) return

		let msg = protocol.parseToMessage('server', type, data)

		if (msg == null) return

		wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send( msg )
			}
		})
	}
}