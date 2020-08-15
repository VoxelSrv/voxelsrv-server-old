const { chat, items, players, commands, blocks } = require('../src/api')

const blockIDs = blocks.getIDs()


function give(id, arg) {
	var player = players.get(id)
	if (items.registry[ arg[0] ] != undefined) {
		var amount = items.registry[ arg[0] ].stack
		if (arg[1] != undefined && 1 <= Math.round( arg[1] ) <= items.registry[ arg[0] ].stack ) amount = Math.round(arg[1])
		
		player.inventory.add(arg[0], amount, {})
		chat.send(id, 'Given ' + amount + ' of ' + arg[0] + ' to you')
	}
	else chat.send(id, arg[0] + ' isn\'t defined item on this server!')
}

function giveAll(id, arg) {
	var player = players.get(id)
	Object.keys( items.registry ).forEach(function(item) {
		player.inventory.add(item, items.registry[ item ].stack , {})
	})
	chat.send(id, 'Given all items to player')
}

function clear(id, arg) {
	var player = players.get(id)
	Object.keys( items.registry ).forEach(function(item) {
		player.inventory.remove(item, items.registry[ item ].stack , {})
	})
	chat.send(id, 'Inventory cleared')
}

function blockID(id, arg) {
	console.log(arg, blockIDs[ arg[0] ])
	if (blockIDs[ arg[0] ] != undefined) chat.send(id, blockIDs[ arg[0].toString() ])
}

commands.register('/give', give, 'Gives item to a player')
commands.register('/giveall', giveAll, 'Gives all items to a player')
commands.register('/clear', clear, 'Clears player\'s inventory')
commands.register('/blockid', blockID, 'Send blockid of item')

