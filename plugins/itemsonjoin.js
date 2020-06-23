const player = require('../src/player')
const items = require('../src/items')


player.event.on('create', function(data) {
	Object.keys( items.get() ).forEach(function(item) {
		player.inv.add(data.id, item, items.getStack(item) , {})
	})	
})
