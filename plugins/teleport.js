const player = require('../src/player')
const commands = require('../src/commands')
const chat = require('../src/chat')
const vec = require('gl-vec3')



function teleport(id, arg) {
	if (arg.length == 1) {
		var plID = player.getIDList()
		var players = []
		for (var x = 0; x < plID.length; x++) {
			if (arg[0].toLowerCase() == player.getName( plID[x] ).toLowerCase() ) {
				player.move(id, {pos: player.getPos(plID[x])}, true)
				chat.send(id, 'Teleported to player ' + player.getName(plID[x]) )
				return
			}
		}

		chat.send(id, 'There is nobody online with this nickname')
	}
	else if (arg.length == 3 ) {
		player.move(id, {pos: [ parseFloat(arg[0]), parseFloat(arg[1]), parseFloat(arg[2]) ]}, true)
		chat.send(id, 'Teleported to player ' + JSON.stringify(arg) )
	}

	else chat.send(id, 'Usage: */tp [playername]* or */tp [x] [y] [z]*')

}


commands.register('/tp', teleport, 'Teleports to other player or location')