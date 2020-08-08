const { hooks, players, commands, console } = require('../src/api')
const fs = require('fs')

if (!fs.existsSync('./plugins/auth') ) fs.mkdirSync('./plugins/auth')
if (!fs.existsSync('./plugins/auth/database.json') ) {
	fs.writeFile('./plugins/auth/database.json', JSON.stringify({}), function (err) {
		if (err) console.error ('Auth - Cant save files! Reason: ' + err);
	})
}

var sessions = {}


function saveDatabase() {
	fs.writeFile('./plugins/auth/database.json', JSON.stringify(playerdata), function (err) {
		if (err) console.error ('Auth - Cant save files! Reason: ' + err);
	})
}

try {
	var playerdata = require('./auth/database.json')
	console.log('^gLoaded password database!')
} catch(e) {
	console.error('^rCan\'t read password database!')
	var playerdata = {}
}


function isLogged(name, obj) {
	if (sessions[obj.id] == true) {
		return 0
	} else {
		return 1
	}
}

function noMove(name, obj) {
	var x = isLogged(name, obj)
	if (x == 0) return x
	else {
		var player = players.get(obj.id)
		player.socket.emit('teleport', player.entity.data.position)

		return x
	} 
}

function noChat(name, obj) {
	var x = isLogged(name, obj)
	if (x == 0) return x
	else {
		if ( obj.data.startsWith('/login') || obj.data.startsWith('/register') ) return 0
		else return 1
	} 
}

players.event.on('disconnect', (id) => {
	sessions[id] = null
	delete sessions[id]
})

players.event.on('connection', (id) => {
	
	setTimeout( () => {
		var player = players.get(id)
		if (player == undefined) return

		if (playerdata[id] == undefined) {
			player.send('{color:orange}Register with: /register [password] [password]{color}')
		} else {
			player.send('{color:orange}Login with: /login [password]{color}')
		}


	}, 2000)
})

async function register(id, arg) {
	if (id == '#console') {
		console.log('^rConsole can\'t use this command!')
		return
	}

	var player = players.get(id)

	if (playerdata[id] == undefined) {
		if (arg[0] == arg[1]) {
			sessions[id] = true
			playerdata[id] = arg[0]

			player.send('{color:green}Registered!{color}')

			console.log('^GPlayer ' + player.nickname + ' has been registered!')
			saveDatabase()


		} else {
			player.send('{color:orange}Usage: /register [password] [password]{color}')
		}
	} else {
		player.send('{color:red}You are already registered!{color}')
	}

}

async function login(id, arg) {
	if (id == '#console') {
		console.log('^rConsole can\'t use this command!')
		return
	}
	var player = players.get(id)

	if (!sessions[id]) {
		if (playerdata[id] != undefined) {

			if (arg[0] == playerdata[id]) {
				sessions[id] = true

				player.send('{color:green}Logged in!{color}')

				console.log('^GPlayer ' + player.nickname + ' logged in!')

			} else {
				player.send('{color:red}Wrong password!{color}')
			}
		
		} else {
			player.send('{color:red}You need to register first!{color}')
		}
		
	} else {
		player.send('{color:red}You are already logged in!{color}')
	}

} 



commands.register('/register', register, 'Registers player')
commands.register('/login', login, 'Logs player in')

hooks.add('player-blockbreak', 0, isLogged)
hooks.add('player-blockplace', 0, isLogged)
hooks.add('player-move', 0, noMove)
hooks.add('player-inventoryclick', 0, isLogged)
hooks.add('player-chatsend', 0, noChat)
