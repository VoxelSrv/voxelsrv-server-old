module.exports = {
	name: 'Give',
	version: '0.0.1',
	supported: '>=0.2.0-alpha'
}

const { registry, commands} = require('../')

function give(executor, arg) {
	if (registry.itemRegistry[ arg[0] ] != undefined) {
		var amount = registry.itemRegistry[ arg[0] ].stack
		const arg1 = parseInt(arg[1])
		if (arg1 != undefined && 1 <= arg1 && arg1 <= registry.itemRegistry[ arg[0] ].stack ) amount = Math.round( parseInt(arg[1]) )
		
		executor.inventory.add(arg[0], amount, {})
		executor.send('Given ' + amount + ' of ' + arg[0] + ' to you')
	}
	else executor.send(arg[0] + ' isn\'t defined item on this server!')
}

function giveAll(executor, arg) {
	Object.keys( registry.itemRegistry ).forEach(function(item) {
		executor.inventory.add(item, registry.itemRegistry[ item ].stack , {})
	})
	executor.send('Given all items to player')
}

function clear(executor, arg) {
	for (let x = 0; x <= executor.inventory.size; x++) {
		executor.inventory.set(x, null, null, null)
	}
	executor.send('Inventory cleared')
}

commands.register('/give', give, 'Gives item to a player')
commands.register('/giveall', giveAll, 'Gives all items to a player')
commands.register('/clear', clear, 'Clears player\'s inventory')
