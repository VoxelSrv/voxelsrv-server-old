module.exports = {
	name: 'ItemsOnJoin',
	version: '0.0.1',
	supported: '>=0.2.0-alpha'
}

const { registry, players } = require('../')

players.event.on('create', function(player) {
	Object.keys( registry.itemRegistry ).forEach( (item) => {
		player.inventory.add(item, registry.itemRegistry[item].stack , {})
	})	
})
