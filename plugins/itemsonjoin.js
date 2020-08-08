const { items, players } = require('../src/api')



players.event.on('create', function(player) {
	Object.keys( items.get() ).forEach(function(item) {
		player.inventory.add(item, items.getStack(item) , {})
	})	
})
