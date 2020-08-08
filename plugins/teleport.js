const { chat, players, commands } = require('../src/api')

const vec = require('gl-vec3')



function teleport(id, arg) {
	var player = players.get(id)
	if (arg.length == 1) {
		var plID = Object.values ( players.getAll() )
		for (var x = 0; x < plID.length; x++) {
			if (arg[0].toLowerCase() == plID[x].nickname.toLowerCase() ) {
				player.teleport(plID[x].entity.data.position, plID[x].entity.world)
				chat.send(id, 'Teleported to player ' + plID[x].nickname )
				return
			}
		}

		chat.send(id, 'There is nobody online with this nickname')
	}
	else if (arg.length == 3 ) {
		player.teleport([ parseFloat(arg[0]), parseFloat(arg[1]), parseFloat(arg[2]) ], player.entity.world)
		chat.send(id, 'Teleported to player ' + JSON.stringify(arg) )
	}

	else chat.send(id, 'Usage: */tp [playername]* or */tp [x] [y] [z]*')

}


commands.register('/tp', teleport, 'Teleports to other player or location')