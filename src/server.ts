import { EventEmitter } from 'events';
import * as fs from 'fs';

import * as players from './lib/player';
import * as registry from './lib/registry';
import * as console from './lib/console';
import * as protocol from './lib/protocol';
import * as entity from './lib/entity';
import * as worldManager from './lib/worlds';
import * as chat from './lib/chat';
import * as permissions from './lib/permissions';
import * as configs from './lib/configs';
import startHeartbeat from './lib/heartbeat';
import { loadPlugins } from './lib/plugins';

import normalGenerator from './default/worldgen/normal';
import flatGenerator from './default/worldgen/flat';

import { serverVersion, serverProtocol, serverConfig, invalidNicknameRegex, setConfig } from './values';

export function startServer(wss: any): void {
	const event = new EventEmitter();

	console.log(`^yStarting VoxelSRV server version^: ${serverVersion} ^y[Protocol:^: ${serverProtocol}^y]`);
	['./plugins', './players', './worlds', './config', './storage'].forEach((element) => {
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

	const config = configs.load('', 'config');
	setConfig(config);

	permissions.loadGroups(configs.load('', 'permissions'));
	configs.save('', 'config', serverConfig);

	event.emit('config-update', config);

	permissions.load();

	loadPlugins();

	registry.loadPalette();

	require('./default/blocks');
	require('./default/items');

	registry.event.emit('registry-define');
	registry.finalize();

	worldManager.addGenerator('normal', normalGenerator);
	worldManager.addGenerator('flat', flatGenerator);

	if (worldManager.exist('default') == false) worldManager.create('default', serverConfig.world.seed, serverConfig.world.generator);
	else worldManager.load('default');

	if (serverConfig.public) startHeartbeat();

	require('./default/commands');

	require('./lib/console-exec');
	require('./lib/protocol-helper').setWS(wss);

	console.log('^yServer started on port: ^:' + serverConfig.port);

	// v Move it somewhere else

	const connections = {};
	let playerCount = 0;

	function sendChat(msg) {
		chat.sendMlt([console.executorchat, ...Object.values(players.getAll())], msg);
	}

	function verifyLogin(data) {
		if (data == undefined) return 'No data!';
		else if (data.username == undefined || invalidNicknameRegex.test(data.username)) return 'Illegal username - ' + data.username;
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
			software: `VoxelSrv-Server ${serverVersion}`,
		});
		const packetEvent = new EventEmitter();

		socket.on('message', (m) => {
			var packet = protocol.parseToObject('client', new Uint8Array(m));
			if (packet != undefined) packetEvent.emit(packet.type, packet.data);
		});

		let loginTimeout = true;

		packetEvent.on('loginResponse', function (data) {
			loginTimeout = false;

			if (playerCount >= serverConfig.maxplayers) {
				send('playerKick', { reason: 'Server is full', time: Date.now() });
				socket.close();
				return;
			}

			const check = verifyLogin(data);
			if (data.username == '' || data.username == null || data.username == undefined) data.username = 'Player' + Math.round(Math.random() * 100000);

			const id = data.username.toLowerCase();

			if (check != 0) {
				send('playerKick', { reason: check, time: Date.now() });
				socket.close();
			}
			if (connections[id] != undefined) {
				send('playerKick', {
					reason: 'Player with that nickname is already online!',
					time: Date.now(),
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

				connections[id] = socket;

				send('playerEntity', { uuid: player.entity.id });

				Object.entries(entity.getAll(player.world)).forEach(function (data: any) {
					send('entityCreate', {
						uuid: data[0],
						data: JSON.stringify(data[1].data),
					});
				});

				const joinMsg = [new chat.ChatComponent(`${player.displayName} joined the game!`, '#b5f598')];
				sendChat(joinMsg);
				chat.event.emit('system-message', joinMsg);
				playerCount = playerCount + 1;

				socket.on('close', function () {
					players.event.emit('disconnect', id);
					const leaveMsg = [new chat.ChatComponent(`${player.displayName} left the game!`, '#f59898')];
					sendChat(leaveMsg);
					chat.event.emit('system-message', leaveMsg);
					player.remove();
					delete connections[id];
					playerCount = playerCount - 1;
				});
				packetEvent.on('actionMessage', function (data) {
					player.action_chatsend(data);
				});

				packetEvent.on('actionBlockBreak', function (data) {
					player.action_blockbreak(data);
				});

				packetEvent.on('actionBlockPlace', function (data) {
					player.action_blockplace(data);
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
