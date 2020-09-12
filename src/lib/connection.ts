import { EventEmitter } from 'events';

import * as players from './player';
import * as registry from './registry';
import * as console from './console';
import * as protocol from './protocol';
import * as entity from './entity';
import * as chat from './chat';

import { serverVersion, serverProtocol, serverConfig, invalidNicknameRegex, } from '../values';


export function setupConnectionHandler(wss) {
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

		send('LoginRequest', {
			name: serverConfig.name,
			motd: serverConfig.motd,
			protocol: serverProtocol,
			maxplayers: serverConfig.maxplayers,
			numberplayers: playerCount,
			software: `VoxelSrv-Server`,
		});
		const packetEvent = new EventEmitter();

		socket.on('message', (m) => {
			var packet = protocol.parseToObject('client', new Uint8Array(m));
			if (packet != undefined) packetEvent.emit(packet.type, packet.data);
		});

		let loginTimeout = true;

		packetEvent.on('LoginResponse', function (data) {
			loginTimeout = false;

			if (playerCount >= serverConfig.maxplayers) {
				send('PlayerKick', { reason: 'Server is full', time: Date.now() });
				socket.close();
				return;
			}

			const check = verifyLogin(data);
			if (data.username == '' || data.username == null || data.username == undefined) data.username = 'Player' + Math.round(Math.random() * 100000);

			const id = data.username.toLowerCase();

			if (check != 0) {
				send('PlayerKick', { reason: check, time: Date.now() });
				socket.close();
			}
			if (connections[id] != undefined) {
				send('PlayerKick', {
					reason: 'Player with that nickname is already online!',
					time: Date.now(),
				});
				socket.close();
			} else {
				players.event.emit('connection', id);
				var player = players.create(id, data, socket, packetEvent);

				send('LoginSuccess', {
					xPos: player.entity.data.position[0],
					yPos: player.entity.data.position[1],
					zPos: player.entity.data.position[2],
					inventory: JSON.stringify(player.inventory),
					blocksDef: JSON.stringify(registry.blockRegistryObject),
					itemsDef: JSON.stringify(registry.itemRegistryObject),
					armor: JSON.stringify(player.entity.data.armor),
				});

				connections[id] = socket;

				send('PlayerEntity', { uuid: player.entity.id });

				Object.entries(entity.getAll(player.world)).forEach(function (data: any) {
					send('EntityCreate', {
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
				packetEvent.on('ActionMessage', function (data) {
					player.action_chatsend(data);
				});

				packetEvent.on('ActionBlockBreak', function (data) {
					player.action_blockbreak(data);
				});

				packetEvent.on('ActionBlockPlace', function (data) {
					player.action_blockplace(data);
				});

				packetEvent.on('ActionMove', function (data) {
					player.action_move({
						pos: [data.x, data.y, data.z],
						rot: data.rotation,
					});
				});

				packetEvent.on('ActionInventoryClick', function (data) {
					player.action_invclick(data);
				});
			}
		});

		setTimeout(function () {
			if (loginTimeout == true) {
				send('PlayerKick', { reason: 'Timeout' });
				socket.close();
			}
		}, 10000);
	});
}