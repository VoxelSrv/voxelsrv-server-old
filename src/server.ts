import { EventEmitter } from 'events';
import * as fs from 'fs';

import { Registry } from './lib/registry';
import { WorldManager } from './lib/worlds';
import { Entity, EntityManager } from './lib/entity';
import { PermissionHolder, PermissionManager } from './lib/permissions';
import { Player, PlayerManager } from './lib/player';

import { MessageBuilder } from './lib/chat';

import * as chat from './lib/chat';
import * as semver from 'semver';
import fetch from 'node-fetch';

import normalGenerator from './default/worldgen/normal';
//import flatGenerator from './default/worldgen/flat';

import { serverVersion, serverProtocol, invalidNicknameRegex, IServerConfig, heartbeatServer, serverDefaultConfig } from './values';
import { BaseSocket } from './socket';
import { ILoginRequest } from 'voxelsrv-protocol/js/server';
import { ILoginResponse } from 'voxelsrv-protocol/js/client';
import { Logging } from './lib/console';

import type { ICoreServer } from 'voxelservercore/interfaces/server';
import type { ICorePlugin } from 'voxelservercore/interfaces/plugin';

import { version as coreVersion } from 'voxelservercore/values';
import { server_setMessageBuilder } from 'voxelservercore/messagebuilder';

export class Server extends EventEmitter implements ICoreServer {
	playerCount: number = 0;
	registry: Registry;
	worlds: WorldManager;
	players: PlayerManager;
	entities: EntityManager;
	permissions: PermissionManager;
	config: IServerConfig;
	heartbeatID: number;
	log: Logging;

	console: Console;

	status: string = 'none';

	plugins: { [index: string]: ICorePlugin } = {};
	constructor() {
		super();
		this.setMaxListeners(200);
		server_setMessageBuilder(MessageBuilder);

		if (!fs.existsSync('./logs/')) fs.mkdirSync('./logs/');
		if (fs.existsSync('./logs/latest.log')) fs.renameSync('./logs/latest.log', `./logs/${Date.now()}.log`);

		this.log = new Logging(fs.createWriteStream('./logs/latest.log', { flags: 'w' }));

		this.status = 'starting';
		this.console = new Console(this);

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
		['./logs', './plugins', './players', './worlds', './config'].forEach((element) => {
			if (!fs.existsSync(element)) {
				try {
					fs.mkdirSync(element);
					this.log.normal([
						{ text: `Created missing directory: `, color: 'orange' },
						{ text: element, color: 'white' },
					]);
				} catch (e) {
					this.log.normal([{ text: `Can't create directory: ${element}! Reason: ${e}`, color: 'red' }]);
					process.exit();
				}
			}
		});

		this.log.normal([
			{ text: `Starting VoxelSRV server version: ${serverVersion} `, color: 'yellow' },
			{ text: `[Protocol: ${serverProtocol}]`, color: 'lightblue' },
		]);

		this.config = { ...serverDefaultConfig, ...this.loadConfig('', 'config') };

		this.permissions.loadGroups(this.loadConfig('', 'permissions'));
		this.saveConfig('', 'config', this.config);

		this.emit('server-config-update', this.config);

		if (this.config.consoleInput) {
			import('./lib/console-exec').then((x) => {
				x.startCmd(this, this.registry.commands);
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

		this.log.normal([
			{ text: 'Server started on port: ', color: 'yellow' },
			{ text: this.config.port.toString(), color: 'lightyellow' },
		]);

		this.emit('server-started', this);
	}

	heartbeatPing() {
		fetch(`http://${heartbeatServer}/api/addServer?ip=${this.config.address}:${this.config.port}`)
			.then((res) => res.json())
			.then((json) => {});
	}

	async connectPlayer(socket: BaseSocket) {
		if (this.status != 'active') return;
		socket.send('LoginRequest', {
			name: this.config.name,
			motd: this.config.motd,
			protocol: serverProtocol,
			maxPlayers: this.config.maxplayers,
			onlinePlayers: this.playerCount,
			software: `VoxelSrv-Server`,
		});

		let loginTimeout = true;

		socket.on('LoginResponse', (data: ILoginResponse) => {
			loginTimeout = false;

			if (this.players.isBanned(data.uuid)) {
				socket.send('PlayerKick', { reason: 'You are banned!\nReason: ' + this.players.getBanReason(data.uuid), time: Date.now() });
				socket.close();
				return;
			} else if (this.players.isIPBanned(socket.ip)) {
				socket.send('PlayerKick', { reason: 'You are banned!\nReason: ' + this.players.getIPBanReason(socket.ip), time: Date.now() });
				socket.close();
				return;
			}

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
				return;
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
				chat.sendMlt([this.log.executorchat, ...Object.values(this.players.getAll())], joinMsg);
				chat.event.emit('system-message', joinMsg);
				this.playerCount = this.playerCount + 1;

				socket.on('close', () => {
					this.emit('player-disconnect', id);
					const leaveMsg = [new chat.ChatComponent(`${player.displayName} left the game!`, '#f59898')];
					chat.sendMlt([this.log.executorchat, ...Object.values(this.players.getAll())], leaveMsg);
					chat.event.emit('system-message', leaveMsg);
					player.remove();
					this.playerCount = this.playerCount - 1;
				});
				socket.on('ActionMessage', async (data) => {
					player.action_chatmessage(data);
				});

				socket.on('ActionBlockBreak', async (data) => {
					player.action_blockbreak(data);
				});

				socket.on('ActionBlockPlace', async (data) => {
					player.action_blockplace(data);
				});

				socket.on('ActionMove', async (data) => {
					player.action_move(data);
				});

				socket.on('ActionMoveLook', async (data) => {
					player.action_move(data);
					player.rotate(data.rotation, data.pitch);
				});

				socket.on('ActionLook', async (data) => {
					player.rotate(data.rotation, data.pitch);
				});

				socket.on('ActionInventoryClick', async (data) => {
					player.action_invclick(data);
				});

				socket.on('ActionClick', async (data) => {
					player.action_click(data);
				});

				socket.on('ActionClickEntity', async (data) => {
					player.action_click(data);
				});

				socket.on('ActionInventoryPick', async (data) => {
					player.action_blockpick(data);
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
				let plugin: ICorePlugin;
				if (file.startsWith('local:')) plugin = require(`${process.cwd()}/plugins/${file.slice(6)}`)(this);
				else plugin = require(file)(this);

				this.loadPlugin(plugin);
			} catch (e) {
				this.emit('plugin-error', file);
				this.log.error(`Can't load plugin ${file}!`);
				console.error(e);
			}
		}
	}

	loadPlugin(plugin: ICorePlugin) {
		if (plugin.game == '*' && !semver.satisfies(coreVersion, plugin.supportedAPI)) {
			this.log.warn([
				new chat.ChatComponent('Plugin ', 'orange'),
				new chat.ChatComponent(plugin.name, 'yellow'),
				new chat.ChatComponent(` might not support this version of server (VoxelServerCore ${coreVersion})!`, 'orange'),
			]);
			const min = semver.minVersion(plugin.supportedAPI);
			const max = semver.maxSatisfying(plugin.supportedAPI);
			if (!!min && !!max && (semver.gt(serverVersion, max) || semver.lt(serverVersion, min)))
				this.log.warn(`It only support versions from ${min} to ${max}.`);
			else if (!!min && !max && semver.lt(serverVersion, min)) this.log.warn(`It only support versions ${min} of VoxelServerCore or newer.`);
			else if (!min && !!max && semver.gt(serverVersion, max)) this.log.warn(`It only support versions ${max} of VoxelServerCore or older.`);
		} else if (plugin.game == 'voxelsrv' && !semver.satisfies(serverVersion, plugin.supportedGameAPI)) {
			this.log.warn([
				new chat.ChatComponent('Plugin ', 'orange'),
				new chat.ChatComponent(plugin.name, 'yellow'),
				new chat.ChatComponent(` might not support this version of server (VoxelSrv Server ${serverVersion})!`, 'orange'),
			]);
			const min = semver.minVersion(plugin.supportedGameAPI);
			const max = semver.maxSatisfying(plugin.supportedGameAPI);
			if (!!min && !!max && (semver.gt(serverVersion, max) || semver.lt(serverVersion, min)))
				this.log.warn(`It only support versions from ${min} to ${max}.`);
			else if (!!min && !max && semver.lt(serverVersion, min)) this.log.warn(`It only support versions ${min} of VoxelSrv Server or newer.`);
			else if (!min && !!max && semver.gt(serverVersion, max)) this.log.warn(`It only support versions ${max} of VoxelSrv Server or older.`);
		} else if (plugin.game != 'voxelsrv' && plugin.game != '*') {
			this.log.warn([
				new chat.ChatComponent('Plugin ', 'orange'),
				new chat.ChatComponent(plugin.name, 'yellow'),
				new chat.ChatComponent(' might not support this version of server!', 'orange'),
			]);
		}

		this.emit('plugin-load', plugin);
		this.plugins[plugin.name] = plugin;
	}

	stopServer() {
		this.status = 'stopping';

		this.emit('server-stop', this);

		this.log.normal([{ text: 'Stopping server...', color: 'orange' }]);
		this.saveConfig('', 'permissions', this.permissions.groups);

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

	loadConfig(namespace: string, config: string) {
		if (fs.existsSync(`./config/${namespace}/${config}.json`)) {
			try {
				const data = fs.readFileSync(`./config/${namespace}/${config}.json`);
				return JSON.parse(data.toString());
			} catch (e) {
				this.log.error(`Invalid config file (./config/${namespace}/${config}.json)!\n${e}`);
				return {};
			}
		} else return {};
	}

	saveConfig(namespace: string, config: string, data: any) {
		if (!fs.existsSync(`./config/${namespace}`)) fs.mkdirSync(`./config/${namespace}`, { recursive: true });

		fs.writeFile(`./config/${namespace}/${config}.json`, JSON.stringify(data, null, 2), function (err) {
			if (err) this.log.error(`Cant save config ${namespace}/${config}! Reason: ${err}`);
		});
	}
}

function verifyLogin(data) {
	if (data == undefined) return 'No data!';
	else if (data.username == undefined || invalidNicknameRegex.test(data.username)) return 'Illegal username - ' + data.username;
	else if (data.protocol == undefined || data.protocol != serverProtocol) return 'Unsupported protocol';

	return 0;
}

class Console {
	s: Server;
	constructor(s: Server) {
		this.s = s;
	}

	executor: any = {
		name: '#console',
		id: '#console',
		send: (...args: any[]) => this.s.log.normal(...args),
		permissions: new PermissionHolder({ '*': true }),
	};

	executorchat: any = { ...this.executor, send: (...args: any[]) => this.s.log.chat(...args) };
}
