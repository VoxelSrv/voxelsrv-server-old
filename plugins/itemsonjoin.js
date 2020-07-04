const players = require('../src/player')
const items = require('../src/items')


players.event.on('create', function(player) {
	Object.keys( items.get() ).forEach(function(item) {
		player.inventory.add(item, items.getStack(item) , {})
	})	
})
