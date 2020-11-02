import { EventEmitter } from 'events';
import * as fs from 'fs';

import { Registry } from './lib/registry';
import * as console from './lib/console';
import { WorldManager } from './lib/worlds';
import { Entity, EntityManager } from './lib/entity';
import { PermissionManager } from './lib/permissions';
import * as configs from './lib/configs';
import { Player, PlayerManager } from './lib/player';
import * as chat from './lib/chat';
import * as semver from 'semver';
import fetch from 'node-fetch';

import normalGenerator from './default/worldgen/normal';
//import flatGenerator from './default/worldgen/flat';

import { serverVersion, serverProtocol, invalidNicknameRegex, IServerConfig, heartbeatServer, serverDefaultConfig } from './values';
import { BaseSocket } from './socket';

export class Server extends EventEmitter {
	playerCount: number = 0;
	registry: Registry;
	worlds: WorldManager;
	players: PlayerManager;
	entities: EntityManager;
	permissions: PermissionManager;
	config: IServerConfig;
	heartbeatID: number;

	status: string = 'none';

	plugins: { [index: string]: IPlugin } = {};
	constructor() {
		super();
		this.setMaxListeners(200);

		this.status = 'starting';
		this.registry = new Registry(this);
		this.worlds = new WorldManager(this);
		this.entities = new EntityManager(this);
		this.permissions = new PermissionManager(this);
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
		if (this.worlds.exist('default') == false) this.worlds.create('default', this.config.world.seed, this.config.world.generator);
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

		this.config = { ...serverDefaultConfig, ...configs.load('', 'config') };

		this.permissions.loadGroups(configs.load('', 'permissions'));
		configs.save('', 'config', this.config);

		this.emit('config-update', this.config);

		if (this.config.consoleInput) {
			import('./lib/console-exec').then((x) => {
				x.startCmd(this.registry.commands);
			});
		}

		if (this.config.plugins.length > 0) this.loadPluginsList(this.config.plugins);

		this.registry._loadPalette();

		await this.initDefaults();

		this.emit('registry-define');

		this.registry._finalize();

		await this.initDefWorld();

		if (this.config.public) this.heartbeatPing();

		this.status = 'active';

		console.log('^yServer started on port: ^:' + this.config.port);
	}

	heartbeatPing() {
		fetch(`http://${heartbeatServer}/addServer?ip=${this.config.address}:${this.config.port}`)
			.then((res) => res.json())
			.then((json) => {
				this.heartbeatID = json.id;
			});
	}

	async connectPlayer(socket: BaseSocket) {
		if (this.status != 'active') return;
		socket.send('LoginRequest', {
			name: this.config.name,
			motd: this.config.motd,
			protocol: serverProtocol,
			maxplayers: this.config.maxplayers,
			numberplayers: this.playerCount,
			software: `VoxelSrv-Server`,
		});

		let loginTimeout = true;

		socket.on('LoginResponse', (data) => {
			loginTimeout = false;

			if (this.playerCount >= this.config.maxplayers) {
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
				this.emit('player-connection', id, socket);
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

	loadPluginsList(list: string[]) {
		this.emit('plugin-load-list', list);
		for (const file of list) {
			try {
				let plugin: IPlugin;
				if (file.startsWith('local:')) plugin = require(`${process.cwd()}/plugins/${file.slice(6)}`)(this);
				else plugin = require(file)(this);

				this.loadPlugin(plugin);
			} catch (e) {
				this.emit('plugin-error', file);
				console.error(`Can't load plugin ${file}!`);
				console.obj(e);
			}
		}
	}

	loadPlugin(plugin: IPlugin) {
		if (!semver.satisfies(serverVersion, plugin.supported)) {
			console.warn([
				new chat.ChatComponent('Plugin ', 'orange'),
				new chat.ChatComponent(plugin.name, 'yellow'),
				new chat.ChatComponent(' might not support this version of server!', 'orange'),
			]);
			const min = semver.minVersion(plugin.supported);
			const max = semver.maxSatisfying(plugin.supported);
			if (!!min && !!max && (semver.gt(serverVersion, max) || semver.lt(serverVersion, min)))
				console.warn(`It only support versions from ${min} to ${max}.`);
			else if (!!min && !max && semver.lt(serverVersion, min)) console.warn(`It only support versions ${min} or newer.`);
			else if (!min && !!max && semver.gt(serverVersion, max)) console.warn(`It only support versions ${max} or older.`);
		}

		this.emit('plugin-load', plugin);
		this.plugins[plugin.name] = plugin;
	}

	stopServer() {
		this.status = 'stopping';

		this.emit('server-stop', this);

		console.log('^rStopping server...');
		configs.save('', 'permissions', this.permissions.groups);

		Object.values(this.players.getAll()).forEach((player) => {
			player.kick('Server close');
		});

		Object.values(this.worlds.worlds).forEach((world) => {
			world.unload();
		});

		setTimeout(() => {
			this.emit('server-stopped', this);
			this.removeAllListeners();
			Object.keys(this).forEach((x) => {
				Object.keys(this[x]).forEach((y) => {
					if (typeof this[x][y] == 'object') this[x][y] = null;
				});

				if (typeof this[x] == 'object') this[x] = null;
			});
		}, 2000);
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
	[index: string]: any;
}
