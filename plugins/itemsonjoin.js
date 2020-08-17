const { registry, players } = require('../src/api')

players.event.on('create', function(player) {
	Object.keys( registry.itemRegistry ).forEach( (item) => {
		player.inventory.add(item, registry.itemRegistry[item].stack , {})
	})	
})
