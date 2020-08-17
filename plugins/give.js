const { chat, registry, players, commands} = require('../')

function give(id, arg) {
	var player = players.get(id)
	if (registry.itemRegistry[ arg[0] ] != undefined) {
		var amount = registry.itemRegistry[ arg[0] ].stack
		if (arg[1] != undefined && 1 <= Math.round( arg[1] ) <= registry.itemRegistry[ arg[0] ].stack ) amount = Math.round(arg[1])
		
		player.inventory.add(arg[0], amount, {})
		chat.send(id, 'Given ' + amount + ' of ' + arg[0] + ' to you')
	}
	else chat.send(id, arg[0] + ' isn\'t defined item on this server!')
}

function giveAll(id, arg) {
	var player = players.get(id)

	Object.keys( registry.itemRegistry ).forEach(function(item) {
		player.inventory.add(item, registry.itemRegistry[ item ].stack , {})
	})
	chat.send(id, 'Given all items to player')
}

function clear(id, arg) {
	var player = players.get(id)
	for (let x = 0; x <= player.inventory.maxslot; x++) {
		player.inventory.set(x, null, null, null)
	}
	chat.send(id, 'Inventory cleared')
}

commands.register('/give', give, 'Gives item to a player')
commands.register('/giveall', giveAll, 'Gives all items to a player')
commands.register('/clear', clear, 'Clears player\'s inventory')
