const { chat, players, commands } = require('../src/api')


async function list(id, arg) {
	chat.send(id, 'Player\s online:')
	var list = '`'
	var playerList = Object.values( players.getAll() )
	console.log(playerList)


	for (var x = 0; x < playerList.length-1; x++) {
		list = list + playerList[x].nickname + ', '
	}

	if (x == playerList.length-1) list = list + playerList[x].nickname
	
	chat.send(id, list + '`')

}

commands.register('/list', list, 'Display list of online players')