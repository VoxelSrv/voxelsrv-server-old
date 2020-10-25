import { EventEmitter } from 'events';
import * as fs from 'fs';

import { Registry } from './lib/registry';
import * as console from './lib/console';
import { WorldManager } from './lib/worlds';
import { Entity, EntityManager } from './lib/entity';
import * as permissions from './lib/permissions';
import * as configs from './lib/configs';
import { Player, PlayerManager } from './lib/player';
import * as chat from './lib/chat';
import * as semver from 'semver';


import startHeartbeat from './lib/heartbeat';

import normalGenerator from './default/worldgen/normal';
//import flatGenerator from './default/worldgen/flat';

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

export class Server extends EventEmitter {
	playerCount: number = 0;
	registry: Registry;
	worlds: WorldManager;
	players: PlayerManager;
	entities: EntityManager;

	plugins: {[index: string]: IPlugin} = {}
	constructor() {
		super();
		this.registry = new Registry(this);
		this.worlds = new WorldManager(this);
		this.entities = new EntityManager(this);

		this.players = new PlayerManager(this);

		this.startServer();
	}

	private async initDefaults() {
		(await import('./default/blocks')).setup(this.registry);
		(await import('./default/items')).setup(this.registry);
		(await import('./default/commands')).setup(this.registry, this);
		this.worlds.addGenerator('normal', normalGenerator);
		//this.worlds.addGenerator('flat', flatGenerator);
	}

	private async initDefWorld() {
		if (this.worlds.exist('default') == false) this.worlds.create('default', serverConfig.world.seed, serverConfig.world.generator);
		else this.worlds.load('default');
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
		import('./lib/console-exec').then((x) => {
			x.startCmd(this.registry.commands);
		});

		const config = configs.load('', 'config');
		setConfig(config);

		permissions.loadGroups(configs.load('', 'permissions'));
		configs.save('', 'config', serverConfig);

		this.emit('config-update', config);

		if (serverConfig.loadPlugins) await this.loadPlugins();

		this.registry._loadPalette();

		await this.initDefaults();

		this.emit('registry-define');

		this.registry._finalize();

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
			if (this.players.get(id) != null) {
				socket.send('PlayerKick', {
					reason: 'Player with that nickname is already online!',
					time: Date.now(),
				});
				socket.close();
			} else {
				this.emit('player-connection', id);
				var player = this.players.create(id, data, socket);

				socket.send('LoginSuccess', {
					xPos: player.entity.data.position[0],
					yPos: player.entity.data.position[1],
					zPos: player.entity.data.position[2],
					inventory: JSON.stringify(player.inventory.getObject()),
					blocksDef: JSON.stringify(this.registry._blockRegistryObject),
					itemsDef: JSON.stringify(this.registry._itemRegistryObject),
					armor: JSON.stringify(player.entity.data.armor.getObject()),
					allowCheats: false,
					allowCustomSkins: true,
					movement: JSON.stringify(player.movement),
				});

				socket.send('PlayerHealth', {
					value: player.entity.data.health,
				});

				socket.send('PlayerEntity', { uuid: player.entity.id });

				Object.entries(player.world.entities).forEach((data) => {
					socket.send('EntityCreate', {
						uuid: data[0],
						data: JSON.stringify(data[1].getObject().data),
					});
				});

				const joinMsg = [new chat.ChatComponent(`${player.displayName} joined the game!`, '#b5f598')];
				chat.sendMlt([console.executorchat, ...Object.values(this.players.getAll())], joinMsg);
				chat.event.emit('system-message', joinMsg);
				this.playerCount = this.playerCount + 1;

				socket.on('close', () => {
					this.emit('player-disconnect', id);
					const leaveMsg = [new chat.ChatComponent(`${player.displayName} left the game!`, '#f59898')];
					chat.sendMlt([console.executorchat, ...Object.values(this.players.getAll())], leaveMsg);
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

	async loadPlugins() {
		const pluginFiles = fs.readdirSync('./plugins');
	
		for (const file of pluginFiles) {
			try {
				let plugin: IPlugin;
				if (file.endsWith('.ts') || file.endsWith('.js')) plugin = await import(`${process.cwd()}/plugins/${file}`);
				else if (fs.existsSync(`./plugins/${file}/index.ts`) || fs.existsSync(`${process.cwd()}/plugins/${file}/index.js`)) plugin = await import(`${process.cwd()}/plugins/${file}/`);
				else continue;
				if (!semver.satisfies(serverVersion, plugin.supported)) {
					console.warn([new chat.ChatComponent('Plugin ', 'orange'), new chat.ChatComponent(file, 'yellow'),  new chat.ChatComponent(' might not support this version of server!', 'orange')]);
					const min = semver.minVersion(plugin.supported);
					const max = semver.maxSatisfying(plugin.supported);
					if (!!min && !!max && (semver.gt(serverVersion, max) || semver.lt(serverVersion, min)))
						console.warn(`It only support versions from ${min} to ${max}.`);
					else if (!!min && !max && semver.lt(serverVersion, min)) console.warn(`It only support versions ${min} or newer.`);
					else if (!min && !!max && semver.gt(serverVersion, max)) console.warn(`It only support versions ${max} or older.`);
				}
	
				plugin._start(this)
				this.plugins[plugin.name] = plugin;
			} catch (e) {
				console.error(`Can't load plugin ${file}!`);
				console.obj(e)
			}
		}
	}
}

function verifyLogin(data) {
	if (data == undefined) return 'No data!';
	else if (data.username == undefined || invalidNicknameRegex.test(data.username)) return 'Illegal username - ' + data.username;
	else if (data.protocol == undefined || data.protocol != serverProtocol) return 'Unsupported protocol';

	return 0;
}


export interface IPlugin {
	name: string;
	version: string;
	supported: string;
	_start: (server: Server) => void 
	[index: string]: any;
}