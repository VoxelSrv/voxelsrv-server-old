import { EventEmitter } from 'events';
import * as fs from 'fs';

import * as players from './lib/player';
import * as registry from './lib/registry';
import * as console from './lib/console';
import * as protocol from './lib/protocol';
import * as prothelper from './lib/protocol-helper';
import * as entity from './lib/entity';
import * as worldManager from './lib/worlds';
import startHeartbeat from './lib/heartbeat';
import { loadPlugins } from './lib/plugins'

import { serverVersion, serverProtocol, serverConfig, invalidNicknameRegex, setConfig } from './values';

export function startServer(wss: any, config: object): void {

	const event = new EventEmitter();

	console.log(`^yStarting VoxelSRV server version^: ${serverVersion} ^y[Protocol:^: ${serverProtocol}^y]`);
	['./plugins', './players', './worlds'].forEach((element) => {
		if (!fs.existsSync(element)) {
			try {
				fs.mkdirSync(element);
				console.log(`^BCreated missing directory: ^w${element}`);
			} catch (e) {
				console.log(`^rCan't create directory: ^w${element}! Reason: ${e}`);
				process.exit();
			}
		}
	});

	setConfig(config);
	event.emit('config-update', config)

	loadPlugins()

	registry.loadPalette();

	require('./default/blocks');
	require('./default/items');

	registry.event.emit('registry-define');
	registry.finalize();

	worldManager.addGenerator('normal', require('./default/worldgen/normal'));
	worldManager.addGenerator('flat', require('./default/worldgen/flat'));

	if (worldManager.exist('default') == false)
		worldManager.create('default', serverConfig.world.seed, serverConfig.world.generator);
	else worldManager.load('default');

	if (serverConfig.public) startHeartbeat();

	require('./default/commands');

	require('./lib/console-exec');
	require('./lib/protocol-helper').setWS(wss);

	console.log('^yServer started on port: ^:' + serverConfig.port);

	// v Move it somewhere else

	const connections = {};
	let playerCount = 0;

	function sendChat(id, msg) {
		if (id == '#console') console.log(msg);
		else if (id == '#all') {
			console.chat(msg);
			prothelper.broadcast('chatMessage', { message: msg });
		} else players.get('id').send(msg);
	}

	function verifyLogin(data) {
		if (data == undefined) return 'No data!';
		else if (data.username == undefined || invalidNicknameRegex.test(data.username))
			return 'Illegal username - ' + data.username;
		else if (data.protocol == undefined || data.protocol != serverProtocol) return 'Unsupported protocol';

		return 0;
	}

	wss.on('connection', async function (socket) {
		socket.binaryType = 'arraybuffer';

		function send(type, data) {
			socket.send(protocol.parseToMessage('server', type, data));
		}

		send('loginRequest', {
			name: serverConfig.name,
			motd: serverConfig.motd,
			protocol: serverProtocol,
			maxplayers: serverConfig.maxplayers,
			numberplayers: playerCount,
			software: 'VoxelSrv-Server',
		});
		const packetEvent = new EventEmitter();

		socket.on('message', (m) => {
			var packet = protocol.parseToObject('client', new Uint8Array(m));
			packetEvent.emit(packet.type, packet.data);
		});

		let loginTimeout = true;

		packetEvent.on('loginResponse', function (data) {
			loginTimeout = false;

			if (playerCount >= serverConfig.maxplayers) {
				send('playerKick', { reason: 'Server is full' });
				socket.close();
				return;
			}

			const check = verifyLogin(data);
			if (data.username == '' || data.username == null || data.username == undefined)
				data.username = 'Player' + Math.round(Math.random() * 100000);

			const id = data.username.toLowerCase();

			if (check != 0) {
				send('playerKick', { reason: check });
				socket.close();
			}
			if (connections[id] != undefined) {
				send('playerKick', {
					reason: 'Player with that nickname is already online!',
				});
				socket.close();
			} else {
				players.event.emit('connection', id);
				var player = players.create(id, data, socket, packetEvent);

				send('loginSuccess', {
					xPos: player.entity.data.position[0],
					yPos: player.entity.data.position[1],
					zPos: player.entity.data.position[2],
					inventory: JSON.stringify(player.inventory),
					blocksDef: JSON.stringify(registry.blockRegistryObject),
					itemsDef: JSON.stringify(registry.itemRegistryObject),
					armor: JSON.stringify(player.entity.data.armor),
				});

				player.entity.data.armor.set(0, 'stone', 9)
				player.entity.data.armor.set(1, 'cobblestone', 15)
				player.entity.data.armor.set(2, 'white_wool', 18)
				player.entity.data.armor.set(3, 'glass', 100)




				connections[id] = socket;

				send('playerEntity', { uuid: player.entity.id });

				Object.entries(entity.getAll(player.world)).forEach(function (data: any) {
					send('entityCreate', {
						uuid: data[0],
						data: JSON.stringify(data[1].data),
					});
				});

				sendChat('#all', player.nickname + ' joined the game!');
				playerCount = playerCount + 1;

				socket.on('close', function () {
					players.event.emit('disconnect', id);
					sendChat('#all', player.nickname + ' left the game!');
					player.remove();
					delete connections[id];
					playerCount = playerCount - 1;
				});
				packetEvent.on('actionMessage', function (data) {
					player.action_chatsend(data.message);
				});

				packetEvent.on('actionBlockBreak', function (data) {
					player.action_blockbreak([data.x, data.y, data.z]);
				});

				packetEvent.on('actionBlockPlace', function (data) {
					player.action_blockplace([data.x, data.y, data.z]);
				});

				packetEvent.on('actionMove', function (data) {
					player.action_move({
						pos: [data.x, data.y, data.z],
						rot: data.rotation,
					});
				});

				packetEvent.on('actionInventoryClick', function (data) {
					player.action_invclick(data);
				});
			}
		});

		setTimeout(function () {
			if (loginTimeout == true) {
				send('playerKick', { reason: 'Timeout' });
				socket.close();
			}
		}, 10000);
	});
}
