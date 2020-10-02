import { EventEmitter } from 'events';
import * as fs from 'fs';

import * as registry from './lib/registry';
import * as console from './lib/console';
import * as worldManager from './lib/worlds';
import * as permissions from './lib/permissions';
import * as configs from './lib/configs';
import * as players from './lib/player';
import * as chat from './lib/chat';

import startHeartbeat from './lib/heartbeat';
import { loadPlugins } from './lib/plugins';

import normalGenerator from './default/worldgen/normal';
import flatGenerator from './default/worldgen/flat';

import { serverVersion, serverProtocol, serverConfig, setConfig, invalidNicknameRegex } from './values';
import { BaseSocket } from './socket';

let server: Server;

export function getServerInstance(): Server {
	return server;
}

export function startServer(): Server {
	server = new Server();
	return server;
}

class Server extends EventEmitter {
	playerCount: number = 0;
	constructor() {
		super();
		this.startServer();
	}

	private async initDefaults() {
		await import('./default/blocks');
		await import('./default/items');
		await import('./default/commands');

		worldManager.addGenerator('normal', normalGenerator);
		worldManager.addGenerator('flat', flatGenerator);
	}

	private async initDefWorld() {
		if (worldManager.exist('default') == false) worldManager.create('default', serverConfig.world.seed, serverConfig.world.generator);
		else worldManager.load('default');
	}

	private async startServer() {
		console.log(`^yStarting VoxelSRV server version^: ${serverVersion} ^y[Protocol:^: ${serverProtocol}^y]`);
		['./plugins', './players', './worlds', './config'].forEach((element) => {
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
		import('./lib/console-exec');

		const config = configs.load('', 'config');
		setConfig(config);

		permissions.loadGroups(configs.load('', 'permissions'));
		configs.save('', 'config', serverConfig);

		this.emit('config-update', config);

		if (serverConfig.loadPlugins) await loadPlugins();

		registry.loadPalette();

		await this.initDefaults();

		registry.event.emit('registry-define');

		registry.finalize();

		await this.initDefWorld();

		if (serverConfig.public) startHeartbeat();

		console.log('^yServer started on port: ^:' + serverConfig.port);
	}

	async connectPlayer(socket: BaseSocket) {
		socket.send('LoginRequest', {
			name: serverConfig.name,
			motd: serverConfig.motd,
			protocol: serverProtocol,
			maxplayers: serverConfig.maxplayers,
			numberplayers: this.playerCount,
			software: `VoxelSrv-Server`,
		});

		let loginTimeout = true;

		socket.on('LoginResponse', (data) => {
			loginTimeout = false;

			if (this.playerCount >= serverConfig.maxplayers) {
				socket.send('PlayerKick', { reason: 'Server is full', time: Date.now() });
				socket.close();
				return;
			}

			const check = verifyLogin(data);
			if (data.username == '' || data.username == null || data.username == undefined) data.username = 'Player' + Math.round(Math.random() * 100000);

			const id = data.username.toLowerCase();

			if (check != 0) {
				socket.send('PlayerKick', { reason: check, time: Date.now() });
				socket.close();
			}
			if (players.get(id) != null) {
				socket.send('PlayerKick', {
					reason: 'Player with that nickname is already online!',
					time: Date.now(),
				});
				socket.close();
			} else {
				players.event.emit('connection', id);
				var player = players.create(id, data, socket);

				socket.send('LoginSuccess', {
					xPos: player.entity.data.position[0],
					yPos: player.entity.data.position[1],
					zPos: player.entity.data.position[2],
					inventory: JSON.stringify(player.inventory),
					blocksDef: JSON.stringify(registry.blockRegistryObject),
					itemsDef: JSON.stringify(registry.itemRegistryObject),
					armor: JSON.stringify(player.entity.data.armor),
					allowCheats: false,
					allowCustomSkins: true,
					movement: JSON.stringify(player.movement),
				});

				socket.send('PlayerHealth', {
					value: player.entity.data.health,
				});

				socket.send('PlayerEntity', { uuid: player.entity.id });

				Object.entries(player.world.entities).forEach((data: any) => {
					socket.send('EntityCreate', {
						uuid: data[0],
						data: JSON.stringify(data[1].data),
					});
				});

				const joinMsg = [new chat.ChatComponent(`${player.displayName} joined the game!`, '#b5f598')];
				sendChat(joinMsg);
				chat.event.emit('system-message', joinMsg);
				this.playerCount = this.playerCount + 1;

				socket.on('close', () => {
					players.event.emit('disconnect', id);
					const leaveMsg = [new chat.ChatComponent(`${player.displayName} left the game!`, '#f59898')];
					sendChat(leaveMsg);
					chat.event.emit('system-message', leaveMsg);
					player.remove();
					this.playerCount = this.playerCount - 1;
				});
				socket.on('ActionMessage', (data) => {
					player.action_chatsend(data);
				});

				socket.on('ActionBlockBreak', (data) => {
					player.action_blockbreak(data);
				});

				socket.on('ActionBlockPlace', (data) => {
					player.action_blockplace(data);
				});

				socket.on('ActionMove', (data) => {
					player.action_move(data);
				});

				socket.on('ActionInventoryClick', (data) => {
					player.action_invclick(data);
				});

				socket.on('ActionClick', (data) => {
					player.action_click(data);
				});

				socket.on('ActionClickEntity', (data) => {
					player.action_click(data);
				});
			}
		});

		setTimeout(() => {
			if (loginTimeout == true) {
				socket.send('PlayerKick', { reason: 'Timeout!' });
				socket.close();
			}
		}, 10000);
	}
}

function sendChat(msg) {
	chat.sendMlt([console.executorchat, ...Object.values(players.getAll())], msg);
}

function verifyLogin(data) {
	if (data == undefined) return 'No data!';
	else if (data.username == undefined || invalidNicknameRegex.test(data.username)) return 'Illegal username - ' + data.username;
	else if (data.protocol == undefined || data.protocol != serverProtocol) return 'Unsupported protocol';

	return 0;
}
