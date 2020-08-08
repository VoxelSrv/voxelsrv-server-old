const { players, protocol } = require('../src/api')

const cfg = require('../config.json')



setInterval( function() {
	var playerList = Object.values( players.getAll() )

	var tab = '**Welcome on ' + cfg.name + '!**<br><center>'

	playerList.forEach(function(player) {
		tab = tab + player.nickname + '<br>'
	})

	tab = tab + '</center>'

	protocol.sendAll('tab-update', tab)
}, 1000)