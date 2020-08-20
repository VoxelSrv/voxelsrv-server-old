module.exports = {
	name: 'PlayerList',
	version: '0.0.1',
	api: '0.2.0-dev'
}

const { players, commands } = require('../src/api')

async function list(executor, arg) {
	executor.send('Player\s online:')
	var list = '`'
	var playerList = Object.values( players.getAll() )
	console.log(playerList)


	for (var x = 0; x < playerList.length-1; x++) {
		list = list + playerList[x].nickname + ', '
	}

	if (x == playerList.length-1) list = list + playerList[x].nickname
	
	executor.send(id, list + '`')

}

commands.register('/list', list, 'Display list of online players')