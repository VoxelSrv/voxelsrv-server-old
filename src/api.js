const EventEmitter = require('events');

const commands = require('./lib/commands');
const console = require('./lib/console');
const entity = require('./lib/entity');
const inventory = require('./lib/inventory');
const player = require('./lib/player');
const protocol = require('./lib/protocol');
const prothelper = require('./lib/protocol-helper');
const worlds = require('./lib/worlds');
const registry = require('./lib/registry');
const values = require('./values');
const plugins = require('./lib/plugins')

const eventChat = new EventEmitter();

function sendChatMessage(id, msg) {
	if (id == -1 || id == '#console') console.log(msg);
	else if (id <= -2 || id == '#all') {
		prothelper.broadcast('chatMessage', { message: msg });
		console.chat(msg);
	} else {
		var p = player.get(id);
		if (p != undefined) p.send(msg);
	}
	eventChat.emit('message', { id: id, msg: msg });
}

player.event.on('chat-message', (id, msg) => {
	eventChat.emit('message', { id: id, msg: msg });
});

const api = {
	players: {
		get: player.get,
		getAll: player.getAll,
		event: player.event,
	},
	chat: {
		send(id, msg) {
			sendChatMessage(id, msg);
		},
		sendAll(msg) {
			sendChatMessage(-2, msg);
		},
		event: eventChat,
	},
	commands: {
		register: commands.register,
		execute: commands.execute,
		event: commands.event,
	},
	console: console,
	entities: {
		create: entity.create,
		recreate: entity.recreate,
		get: entity.get,
		getAll: entity.getAll,
	},
	inventories: inventory,
	protocol: {
		server: prothelper.wss,
		sendAll: prothelper.broadcast,
		broadcast: prothelper.broadcast,
		...protocol,
	},
	registry: {
		addItem: registry.addItem,
		addBlock: registry.addBlock,
		itemRegistry: registry.itemRegistry,
		blockRegistry: registry.blockRegistry,
		Block: registry.Block,
		ItemBlock: registry.ItemBlock,
		Item: registry.Item,
		ItemStack: registry.ItemStack,
	},

	worlds: worlds,
	values: values,
	plugins: {
		plugins: plugins.plugins,
		IPlugin: plugins.IPlugin
	}
};

module.exports = api;
