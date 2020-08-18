module.exports = {
	name: 'Tab',
	version: '0.0.1',
	api: '0.2.0-dev'
}

const { players, protocol } = require('../src/api')

const cfg = require('../config.json')



setInterval( function() {
	var playerList = Object.values( players.getAll() )

	var tab = '**Welcome on ' + cfg.name + '!**<br><center>'

	playerList.forEach(function(player) {
		tab = tab + player.nickname + '<br>'
	})

	tab = tab + '</center>'

	protocol.broadcast('tabUpdate', { message: tab })
}, 1000)