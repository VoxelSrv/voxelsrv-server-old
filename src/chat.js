const EventEmiter = require('events')
const event = new EventEmiter()
const console = require('./console')


module.exports = {
	send(id, msg) { sendMessage(id, msg) },
	sendAll(msg) { sendMessage(-2, msg) },
	event: event
}

const protocol = require('./protocol')

function sendMessage(id, msg) {
	if (id == -1 || id == '#console') console.log(msg)
	else if (id <= -2 || id == "#all") {
		protocol.sendAll('chat', msg)
		console.chat(msg)
	}
	else protocol.send(id, 'chat', msg)
	event.emit('message', {id: id, msg: msg})
}


