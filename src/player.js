const EventEmiter = require('events')
const event = new EventEmiter()

module.exports = {
	create(id, data) { createPlayer(id, data) },
	remove(id) { removePlayer(id) },
	getName(id) { return getNickname(id) },
	event: event
}

var player = {}

function createPlayer(id, data) {
	player[id] = {
		id: id,
		nickname: data.username
	}

	event.emit('create', player[id])
}

function movePlayer(id, pos) {
	event.emit('move', {id: id, pos: pos})
}

function removePlayer(id) {
	event.emit('remove', player[id])
	player[id] = null
}

function getNickname(id) {
	return player[id].nickname
}

