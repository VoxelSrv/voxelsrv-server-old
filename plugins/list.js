const player = require('../src/player')
const commands = require('../src/commands')
const chat = require('../src/chat')

async function list(id, arg) {
	chat.send(id, 'Player\s online:')
	var list = '`'
	var pidlist = player.getIDList()

	for (var x = 0; x < pidlist.length-1; x++) {
		list = list + player.getName(pidlist[x]) + ', '
	}

	if (x == pidlist.length-1) list = list + player.getName(pidlist[x])
	
	chat.send(id, list + '`')

}

commands.register('/list', list, 'Display list of online players')