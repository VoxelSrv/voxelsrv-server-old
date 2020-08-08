const blocks = require('./blocks')
const chat = require('./chat')
const commands = require('./commands')
const console = require('./console')
const entity = require('./entity')
const hooks = require('./hooks')
const inventory = require('./inventory')
const items = require('./items')
const player = require('./player')
const protocol = require('./protocol')
const worlds = require('./worlds')


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
	chat: chat,
	commands: commands,
	console: console,
	entities: entity,
	items: {
		get: items.get,
		getStack: items.getStack
	},
	inventories: inventory,
	protocol: protocol,
	worlds: worlds
}

module.exports = api