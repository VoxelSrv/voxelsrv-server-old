const protocol = require('../src/protocol')
const player = require('../src/player')
const cfg = require('../config.json')



setInterval( function() {
	var players = player.getIDList()

	var tab = '**Welcome on ' + cfg.name + '!**<br><center>'

	players.forEach(function(id) {
		tab = tab + player.getName(id) + '<br>'
	})

	tab = tab + '</center>'

	protocol.sendAll('tab-update', tab)
}, 1000)