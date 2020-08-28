module.exports = {
	name: 'Teleport',
	version: '0.0.1',
	supported: '>=0.2.0-alpha.3'
}

const { players, commands } = require('server')

const vec = require('gl-vec3')


function teleport(executor, arg) {
	if (arg.length == 1) {
		var plID = Object.values ( players.getAll() )
		for (var x = 0; x < plID.length; x++) {
			if (arg[0].toLowerCase() == plID[x].nickname.toLowerCase() ) {
				executor.teleport(plID[x].entity.data.position, plID[x].entity.world)
				executor.send('Teleported to player ' + plID[x].nickname )
				return
			}
		}

		executor.send('There is nobody online with this nickname')
	}
	else if (arg.length == 3 ) {
		executor.teleport([ parseFloat(arg[0]), parseFloat(arg[1]), parseFloat(arg[2]) ], executor.entity.world)
		executor.send('Teleported to player ' + JSON.stringify(arg) )
	}

	else executor.send('Usage: */tp [playername]* or */tp [x] [y] [z]*')

}


commands.register('/tp', teleport, 'Teleports to other player or location')