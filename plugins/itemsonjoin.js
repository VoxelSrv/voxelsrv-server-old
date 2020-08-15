const { items, players } = require('../src/api')

players.event.on('create', function(player) {
	Object.keys( items.registry ).forEach( (item) => {
		player.inventory.add(item, items.registry[item].stack , {})
	})	
})
