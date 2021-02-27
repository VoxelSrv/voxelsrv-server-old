import { EventEmitter } from 'events';
import * as fs from 'fs';

import { Registry } from './lib/registry';
import { WorldManager, EntityManager } from './lib/world/manager';
import { PermissionHolder, PermissionManager } from './lib/permissions';
import { PlayerManager } from './lib/player/player';

import { MessageBuilder } from './lib/chat';

import * as chat from './lib/chat';
import * as semver from 'semver';
import fetch from 'node-fetch';

import normalGenerator from './default/worldgen/normal';
import flatGenerator from './default/worldgen/flat';

import { serverVersion, serverProtocol, invalidNicknameRegex, IServerConfig, heartbeatServer, serverDefaultConfig } from './values';
import { BaseSocket } from './socket';
import { ILoginResponse } from 'voxelsrv-protocol/js/client';
import { Logging } from './lib/console';

import type { ICoreServer } from 'voxelservercore/interfaces/server';
import type { ICorePlugin, ICorePluginManager } from 'voxelservercore/interfaces/plugin';

import { version as coreVersion } from 'voxelservercore/values';
import { server_setMessageBuilder, server_setMessageStringify } from 'voxelservercore/api';

export class Server extends EventEmitter implements ICoreServer {
	name = 'VoxelSrv Server';
	version = serverVersion;

	playerCount: number = 0;
	registry: Registry;
	worlds: WorldManager;
	players: PlayerManager;
	entities: EntityManager;
	permissions: PermissionManager;
	log: Logging;
	plugins: PluginManager;
	console: Console;

	config: IServerConfig;
	heartbeatUpdater: any;

	overrides: {[i: string]: [string, string]};

	status: string = 'none';

	constructor(startServer: boolean = true) {
		super();
		this.setMaxListeners(200);
		server_setMessageBuilder(MessageBuilder);
		server_setMessageStringify(chat.convertToPlain);

		if (!fs.existsSync('./logs/')) fs.mkdirSync('./logs/');
		if (fs.existsSync('./logs/latest.log')) fs.renameSync('./logs/latest.log', `./logs/${Date.now()}.log`);

		this.log = new Logging(fs.createWriteStream('./logs/latest.log', { flags: 'w' }));

		this.overrides = { worldGenWorkers: ['./', ''] }

		this.status = 'initiating';
		this.console = new Console(this);

		this.registry = new Registry(this);
		this.worlds = new WorldManager(this);
		this.entities = new EntityManager(this);
		this.permissions = new PermissionManager(this);
		this.players = new PlayerManager(this);
		this.plugins = new PluginManager(this);


		if (startServer) {
			this.startServer();
		}
	}

	private async initDefaults() {
		(await import('./default/blocks')).setup(this.registry);
		(await import('./default/items')).setup(this.registry);
		(await import('./default/commands')).setup(this.registry, this);
		this.worlds.addGenerator('normal', normalGenerator);
		this.worlds.addGenerator('flat', flatGenerator);
	}

	private async initDefWorld() {
		if (this.worlds.exist('default') == false) this.worlds.create('default', this.config.world.seed, this.config.world.generator);
		else this.worlds.load('default');
	}

	public async startServer() {
		if (this.status != 'initiating') return;

		this.status = 'starting';
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

		const tmpConfig = this.loadConfig('', 'config');

		this.config = { ...serverDefaultConfig, ...tmpConfig };
		this.config.world = {...serverDefaultConfig.world, ...tmpConfig.world }

		this.permissions.loadGroups(this.loadConfig('', 'permissions'));
		this.saveConfig('', 'config', this.config);

		this.emit('server-config-update', this.config);

		if (this.config.consoleInput) {
			import('./lib/console-exec').then((x) => {
				x.startCmd(this, this.registry.commands);
			});
		}

		if (this.config.plugins.length > 0) this.plugins._loadPlugins(this.config.plugins);

		this.registry._loadPalette();

		await this.initDefaults();

		this.emit('registry-define');

		this.registry._finalize();

		await this.initDefWorld();

		if (this.config.public) {
			this.heartbeatPing();

			this.heartbeatUpdater = setInterval(() => {
				const address = (this.config.useWSS ? 'wss://' : 'ws://') + `${this.config.address}:${this.config.port}`;

				fetch(`${heartbeatServer}/api/servers`)
					.then((res) => res.json())
					.then((json) => {
						if (json[address] == undefined) {
							this.heartbeatPing();
						}
					});
			}, 50000)
		}
		this.status = 'active';

		this.log.normal([
			{ text: 'Server started on port: ', color: 'yellow' },
			{ text: this.config.port.toString(), color: 'lightyellow' },
		]);

		this.emit('server-started', this);
	}

	heartbeatPing() {
		const address = (this.config.useWSS ? 'wss://' : 'ws://') + `${this.config.address}:${this.config.port}`;

		fetch(`${heartbeatServer}/api/addServer?ip=${address}&type=0`)
			.then((res) => res.json())
			.then((json) => {});
	}

	async connectPlayer(socket: BaseSocket) {
		if (this.status != 'active') return;

		if (this.config.debugProtocol) {
			socket.debugListener = (sender, type, data) => {
				console.log(sender, type, data)
			}
		}

		socket.send('LoginRequest', {
			name: this.config.name,
			motd: this.config.motd,
			protocol: serverProtocol,
			maxPlayers: this.config.maxplayers,
			onlinePlayers: this.playerCount,
			software: `VoxelSrv-Server`,
		});

		let loginTimeout = true;

		socket.on('LoginResponse', async (data: ILoginResponse) => {
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

			const check = await this.authenticatePlayer(data);

			const id = data.username.toLowerCase();

			if (check != null) {
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

				const joinMsg = new MessageBuilder().hex('#b5f598').text(`${player.displayName} joined the game!`);
				chat.sendMlt([this.console.executorchat, ...Object.values(this.players.getAll())], joinMsg);
				chat.event.emit('system-message', joinMsg);
				this.playerCount = this.playerCount + 1;

				socket.on('close', () => {
					this.emit('player-disconnect', id);
					const leaveMsg = new MessageBuilder().hex('#f59898').text(`${player.displayName} left the game!`);
					chat.sendMlt([this.console.executorchat, ...Object.values(this.players.getAll())], leaveMsg);
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

	async authenticatePlayer(data: ILoginResponse) {
		if (data == undefined) return 'No data!';
		else if (data.username == undefined || invalidNicknameRegex.test(data.username)) return 'Illegal username - ' + data.username;
		else if (data.protocol == undefined || data.protocol != serverProtocol) return 'Unsupported protocol';

		return null;
	}

	stopServer() {
		if (this.heartbeatUpdater != undefined) {
			clearInterval(this.heartbeatUpdater);
		}

		this.status = 'stopping';

		this.emit('server-stop', this);

		this.log.normal([{ text: 'Stopping server...', color: 'orange' }]);
		this.saveConfig('', 'permissions', this.permissions.toObject());

		Object.values(this.players.getAll()).forEach((player) => {
			player.kick('Server close');
			player.socket.close();
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

class PluginManager implements ICorePluginManager {
	_plugins: { [i: string]: ICorePlugin };
	_server: Server;


	constructor(server: Server) {
		this._server = server;
		this._plugins = {};
	}

	get(name: string): ICorePlugin {
		return this._plugins[name];
	}
	getAll(): { [i: string]: ICorePlugin } {
		return this._plugins;
	}
	load(path: string): boolean {
		try {
			const plugin = path.startsWith('local:') ? require(`${process.cwd()}/plugins/${path.slice(6)}`)(this._server) : require(path)(this._server);

			if (plugin.game == '*' && !semver.satisfies(coreVersion, plugin.supportedAPI)) {
				this._server.log.warn([
					new chat.ChatComponent('Plugin ', 'orange'),
					new chat.ChatComponent(plugin.name, 'yellow'),
					new chat.ChatComponent(` might not support this version of server (VoxelServerCore ${coreVersion})!`, 'orange'),
				]);
				const min = semver.minVersion(plugin.supportedAPI);
				const max = semver.maxSatisfying(plugin.supportedAPI);
				if (!!min && !!max && (semver.gt(serverVersion, max) || semver.lt(serverVersion, min)))
					this._server.log.warn(`It only support versions from ${min} to ${max}.`);
				else if (!!min && !max && semver.lt(serverVersion, min))
					this._server.log.warn(`It only support versions ${min} of VoxelServerCore or newer.`);
				else if (!min && !!max && semver.gt(serverVersion, max))
					this._server.log.warn(`It only support versions ${max} of VoxelServerCore or older.`);
			} else if (plugin.game == 'voxelsrv' && !semver.satisfies(serverVersion, plugin.supportedGameAPI)) {
				this._server.log.warn([
					new chat.ChatComponent('Plugin ', 'orange'),
					new chat.ChatComponent(plugin.name, 'yellow'),
					new chat.ChatComponent(` might not support this version of server (VoxelSrv Server ${serverVersion})!`, 'orange'),
				]);
				const min = semver.minVersion(plugin.supportedGameAPI);
				const max = semver.maxSatisfying(plugin.supportedGameAPI);
				if (!!min && !!max && (semver.gt(serverVersion, max) || semver.lt(serverVersion, min)))
					this._server.log.warn(`It only support versions from ${min} to ${max}.`);
				else if (!!min && !max && semver.lt(serverVersion, min))
					this._server.log.warn(`It only support versions ${min} of VoxelSrv Server or newer.`);
				else if (!min && !!max && semver.gt(serverVersion, max))
					this._server.log.warn(`It only support versions ${max} of VoxelSrv Server or older.`);
			} else if (plugin.game != 'voxelsrv' && plugin.game != '*') {
				this._server.log.warn([
					new chat.ChatComponent('Plugin ', 'orange'),
					new chat.ChatComponent(plugin.name, 'yellow'),
					new chat.ChatComponent(' might not support this version of server!', 'orange'),
				]);
			}

			this._server.emit('plugin-load', plugin);
			this._plugins[plugin.name] = plugin;
		} catch (e) {
			this._server.emit('plugin-error', path);
			this._server.log.error(`Can't load plugin ${path}!`);
			console.error(e);

			return e;
		}
	}

	loadAllNotLoaded(): boolean {
		return false;
	}

	_loadPlugins(list: string[]) {
		this._server.emit('plugin-load-list', list);
		for (const file of list) {
			this.load(file);
		}
	}
}
