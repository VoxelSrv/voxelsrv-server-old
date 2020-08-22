const { players, commands, console } = require('../../');
const fs = require('fs');

module.exports = {
	name: 'Auth',
	version: '0.0.1',
	supports: '>=0.2.0-alpha',
};

if (!fs.existsSync('./plugins/auth')) fs.mkdirSync('./plugins/auth');
if (!fs.existsSync('./plugins/auth/database.json')) {
	fs.writeFile('./plugins/auth/database.json', JSON.stringify({}), function (err) {
		if (err) console.error('Auth - Cant save files! Reason: ' + err);
	});
}

var sessions = {};

function saveDatabase() {
	fs.writeFile('./plugins/auth/database.json', JSON.stringify(playerdata), function (err) {
		if (err) console.error('Auth - Cant save files! Reason: ' + err);
	});
}

try {
	var playerdata = require('./database.json');
	console.log('^gLoaded password database!');
} catch (e) {
	console.error("^rCan't read password database!");
	var playerdata = {};
}

function isLogged(name) {
	if (sessions[name] == true) {
		return true;
	} else {
		return false;
	}
}

function cancel(name, obj) {
	var x = isLogged(name);
	obj.cancel = !x;
}

function noChat(name, obj) {
	var x = isLogged(name);
	if (x) obj.cancel = false;
	else {
		if (obj.message.startsWith('/login') || obj.message.startsWith('/register')) obj.cancel = false;
		else obj.cancel = true;
	}
}

players.event.on('player-move-0', (player, data) => cancel(player.id, data));
players.event.on('player-invclick-0', (player, data) => cancel(player.id, data));
players.event.on('player-blockplace-0', (player, data) => cancel(player.id, data));
players.event.on('player-blockbreak-0', (player, data) => cancel(player.id, data));
players.event.on('player-message-0', (player, data) => noChat(player.id, data));


players.event.on('disconnect', (id) => {
	sessions[id] = null;
	delete sessions[id];
});

players.event.on('connection', (id) => {
	setTimeout(() => {
		var player = players.get(id);
		if (player == undefined) return;

		if (playerdata[id] == undefined) {
			player.send('{color:orange}Register with: /register [password] [password]{color}');
		} else {
			player.send('{color:orange}Login with: /login [password]{color}');
		}
	}, 2000);
});

async function register(executor, arg) {
	if (executor.name == '#console') {
		console.log("^rConsole can't use this command!");
		return;
	}

	if (playerdata[executor.id] == undefined) {
		if (arg[0] == arg[1]) {
			sessions[executor.id] = true;
			playerdata[executor.id] = arg[0];

			executor.send('{color:green}Registered!{color}');

			console.log('^GPlayer ' + executor.nickname + ' has been registered!');
			saveDatabase();
		} else {
			executor.send('{color:orange}Usage: /register [password] [password]{color}');
		}
	} else {
		executor.send('{color:red}You are already registered!{color}');
	}
}

async function login(executor, arg) {
	if (executor.name == '#console') {
		console.log("^rConsole can't use this command!");
		return;
	}

	if (!sessions[executor.id]) {
		if (playerdata[executor.id] != undefined) {
			if (arg[0] == playerdata[executor.id]) {
				sessions[executor.id] = true;

				executor.send('{color:green}Logged in!{color}');

				console.log('^GPlayer ' + executor.nickname + ' logged in!');
			} else {
				executor.send('{color:red}Wrong password!{color}');
			}
		} else {
			executor.send('{color:red}You need to register first!{color}');
		}
	} else {
		executor.send('{color:red}You are already logged in!{color}');
	}
}

commands.register('/register', register, 'Registers player');
commands.register('/login', login, 'Logs player in');