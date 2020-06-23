const items = require('../src/items')
const player = require('../src/player')
const commands = require('../src/commands')
const chat = require('../src/chat')


function give(id, arg) {
	if (items.get()[ arg[0] ] != undefined) {
		var amount = items.getStack(arg[0])
		if (arg[1] != undefined && 1 <= Math.round( arg[1] ) <= items.getStack(arg[0]) ) amount = Math.round(arg[1])
		
		player.inv.add(id, arg[0], amount, {})
		chat.send(id, 'Given ' + amount + ' of ' + arg[0] + ' to you')
	}
	else chat.send(id, arg[0] + ' isn\'t defined item on this server!')
}

function giveAll(id, arg) {
	Object.keys( items.get() ).forEach(function(item) {
		player.inv.add(id, item, items.getStack(item) , {})
	})
	chat.send(id, 'Given all items to player')
}

function clear(id, arg) {
	Object.keys( items.get() ).forEach(function(item) {
		player.inv.remove(id, item, items.getStack(item) , {})
	})
	chat.send(id, 'Inventory cleared')
}


commands.register('/give', give, 'Gives item to a player')
commands.register('/giveall', giveAll, 'Gives all items to a player')
commands.register('/clear', clear, 'Clears player\'s inventory')
