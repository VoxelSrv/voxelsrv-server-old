module.exports = {
	name: 'ItemsOnJoin',
	version: '0.0.1',
	api: '0.2.0-dev'
}

const { registry, players } = require('../src/api')

players.event.on('create', function(player) {
	Object.keys( registry.itemRegistry ).forEach( (item) => {
		player.inventory.add(item, registry.itemRegistry[item].stack , {})
	})	
})
