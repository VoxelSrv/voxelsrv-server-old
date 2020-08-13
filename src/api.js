const actions = require('./actions')
const blocks = require('./blocks')
const commands = require('./commands')
const console = require('./console')
const entity = require('./entity')
const hooks = require('./hooks')
const inventory = require('./inventory')
const items = require('./items')
const player = require('./player')
const protocol = require('./protocol')
const worlds = require('./worlds')

const EventEmiter = require('events')
const eventChat = new EventEmiter()

function sendChatMessage(id, msg) {
	if (id == -1 || id == '#console') console.log(msg)
	else if (id <= -2 || id == "#all") {
		protocol.sendAll('chat', msg)
		console.chat(msg)
	}
	else protocol.send(id, 'chat', msg)
	eventChat.emit('message', {id: id, msg: msg})
}

const api = {
	hooks: hooks,
	players: {
		get: player.get,
		getAll: player.getAll,
		event: player.event
	},
	blocks: {
		get: blocks.get,
		getIDs: blocks.getIDs
	},
	chat: {
		send(id, msg) { sendChatMessage(id, msg) },
		sendAll(msg) { sendChatMessage(-2, msg) },
		event: eventChat
	},
	commands: {
		register: commands.register,
		execute: commands.execute,
		event: commands.event
	},
	console: console,
	entities: {
		create: entity.create,
		recreate: entity.recreate,
		get: entity.get,
		getAll: entity.getAll
	},
	items: {
		get: items.get,
		getStack: items.getStack
	},
	inventories: inventory,
	protocol: {
		server: actions.wss,
		...protocol
	},
	worlds: worlds
}

module.exports = api