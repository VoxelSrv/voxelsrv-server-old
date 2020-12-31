"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const events_1 = require("events");
const fs = __importStar(require("fs"));
const registry_1 = require("./lib/registry");
const worlds_1 = require("./lib/worlds");
const entity_1 = require("./lib/entity");
const permissions_1 = require("./lib/permissions");
const player_1 = require("./lib/player");
const chat_1 = require("./lib/chat");
const chat = __importStar(require("./lib/chat"));
const semver = __importStar(require("semver"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const normal_1 = __importDefault(require("./default/worldgen/normal"));
//import flatGenerator from './default/worldgen/flat';
const values_1 = require("./values");
const console_1 = require("./lib/console");
const values_2 = require("voxelservercore/values");
const api_1 = require("voxelservercore/api");
class Server extends events_1.EventEmitter {
    constructor() {
        super();
        this.playerCount = 0;
        this.status = 'none';
        this.plugins = {};
        this.setMaxListeners(200);
        api_1.server_setMessageBuilder(chat_1.MessageBuilder);
        api_1.server_setMessageStringify(chat.convertToPlain);
        if (!fs.existsSync('./logs/'))
            fs.mkdirSync('./logs/');
        if (fs.existsSync('./logs/latest.log'))
            fs.renameSync('./logs/latest.log', `./logs/${Date.now()}.log`);
        this.log = new console_1.Logging(fs.createWriteStream('./logs/latest.log', { flags: 'w' }));
        this.status = 'starting';
        this.console = new Console(this);
        this.registry = new registry_1.Registry(this);
        this.worlds = new worlds_1.WorldManager(this);
        this.entities = new entity_1.EntityManager(this);
        this.permissions = new permissions_1.PermissionManager(this);
        this.players = new player_1.PlayerManager(this);
        this.startServer();
    }
    async initDefaults() {
        (await Promise.resolve().then(() => __importStar(require('./default/blocks')))).setup(this.registry);
        (await Promise.resolve().then(() => __importStar(require('./default/items')))).setup(this.registry);
        (await Promise.resolve().then(() => __importStar(require('./default/commands')))).setup(this.registry, this);
        this.worlds.addGenerator('normal', normal_1.default);
        //this.worlds.addGenerator('flat', flatGenerator);
    }
    async initDefWorld() {
        if (this.worlds.exist('default') == false)
            this.worlds.create('default', this.config.world.seed, this.config.world.generator);
        else
            this.worlds.load('default');
    }
    async startServer() {
        ['./logs', './plugins', './players', './worlds', './config'].forEach((element) => {
            if (!fs.existsSync(element)) {
                try {
                    fs.mkdirSync(element);
                    this.log.normal([
                        { text: `Created missing directory: `, color: 'orange' },
                        { text: element, color: 'white' },
                    ]);
                }
                catch (e) {
                    this.log.normal([{ text: `Can't create directory: ${element}! Reason: ${e}`, color: 'red' }]);
                    process.exit();
                }
            }
        });
        this.log.normal([
            { text: `Starting VoxelSRV server version: ${values_1.serverVersion} `, color: 'yellow' },
            { text: `[Protocol: ${values_1.serverProtocol}]`, color: 'lightblue' },
        ]);
        this.config = { ...values_1.serverDefaultConfig, ...this.loadConfig('', 'config') };
        this.permissions.loadGroups(this.loadConfig('', 'permissions'));
        this.saveConfig('', 'config', this.config);
        this.emit('server-config-update', this.config);
        if (this.config.consoleInput) {
            Promise.resolve().then(() => __importStar(require('./lib/console-exec'))).then((x) => {
                x.startCmd(this, this.registry.commands);
            });
        }
        if (this.config.plugins.length > 0)
            this.loadPluginsList(this.config.plugins);
        this.registry._loadPalette();
        await this.initDefaults();
        this.emit('registry-define');
        this.registry._finalize();
        await this.initDefWorld();
        if (this.config.public)
            this.heartbeatPing();
        this.status = 'active';
        this.log.normal([
            { text: 'Server started on port: ', color: 'yellow' },
            { text: this.config.port.toString(), color: 'lightyellow' },
        ]);
        this.emit('server-started', this);
    }
    heartbeatPing() {
        node_fetch_1.default(`http://${values_1.heartbeatServer}/api/addServer?ip=${this.config.address}:${this.config.port}`)
            .then((res) => res.json())
            .then((json) => { });
    }
    async connectPlayer(socket) {
        if (this.status != 'active')
            return;
        socket.send('LoginRequest', {
            name: this.config.name,
            motd: this.config.motd,
            protocol: values_1.serverProtocol,
            maxPlayers: this.config.maxplayers,
            onlinePlayers: this.playerCount,
            software: `VoxelSrv-Server`,
        });
        let loginTimeout = true;
        socket.on('LoginResponse', (data) => {
            loginTimeout = false;
            if (this.players.isBanned(data.uuid)) {
                socket.send('PlayerKick', { reason: 'You are banned!\nReason: ' + this.players.getBanReason(data.uuid), time: Date.now() });
                socket.close();
                return;
            }
            else if (this.players.isIPBanned(socket.ip)) {
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
            if (data.username == '' || data.username == null || data.username == undefined)
                data.username = 'Player' + Math.round(Math.random() * 100000);
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
            }
            else {
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
                const joinMsg = new chat_1.MessageBuilder().hex('#b5f598').text(`${player.displayName} joined the game!`);
                chat.sendMlt([this.console.executorchat, ...Object.values(this.players.getAll())], joinMsg);
                chat.event.emit('system-message', joinMsg);
                this.playerCount = this.playerCount + 1;
                socket.on('close', () => {
                    this.emit('player-disconnect', id);
                    const leaveMsg = new chat_1.MessageBuilder().hex('#f59898').text(`${player.displayName} left the game!`);
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
    loadPluginsList(list) {
        this.emit('plugin-load-list', list);
        for (const file of list) {
            try {
                let plugin;
                if (file.startsWith('local:'))
                    plugin = require(`${process.cwd()}/plugins/${file.slice(6)}`)(this);
                else
                    plugin = require(file)(this);
                this.loadPlugin(plugin);
            }
            catch (e) {
                this.emit('plugin-error', file);
                this.log.error(`Can't load plugin ${file}!`);
                console.error(e);
            }
        }
    }
    loadPlugin(plugin) {
        if (plugin.game == '*' && !semver.satisfies(values_2.version, plugin.supportedAPI)) {
            this.log.warn([
                new chat.ChatComponent('Plugin ', 'orange'),
                new chat.ChatComponent(plugin.name, 'yellow'),
                new chat.ChatComponent(` might not support this version of server (VoxelServerCore ${values_2.version})!`, 'orange'),
            ]);
            const min = semver.minVersion(plugin.supportedAPI);
            const max = semver.maxSatisfying(plugin.supportedAPI);
            if (!!min && !!max && (semver.gt(values_1.serverVersion, max) || semver.lt(values_1.serverVersion, min)))
                this.log.warn(`It only support versions from ${min} to ${max}.`);
            else if (!!min && !max && semver.lt(values_1.serverVersion, min))
                this.log.warn(`It only support versions ${min} of VoxelServerCore or newer.`);
            else if (!min && !!max && semver.gt(values_1.serverVersion, max))
                this.log.warn(`It only support versions ${max} of VoxelServerCore or older.`);
        }
        else if (plugin.game == 'voxelsrv' && !semver.satisfies(values_1.serverVersion, plugin.supportedGameAPI)) {
            this.log.warn([
                new chat.ChatComponent('Plugin ', 'orange'),
                new chat.ChatComponent(plugin.name, 'yellow'),
                new chat.ChatComponent(` might not support this version of server (VoxelSrv Server ${values_1.serverVersion})!`, 'orange'),
            ]);
            const min = semver.minVersion(plugin.supportedGameAPI);
            const max = semver.maxSatisfying(plugin.supportedGameAPI);
            if (!!min && !!max && (semver.gt(values_1.serverVersion, max) || semver.lt(values_1.serverVersion, min)))
                this.log.warn(`It only support versions from ${min} to ${max}.`);
            else if (!!min && !max && semver.lt(values_1.serverVersion, min))
                this.log.warn(`It only support versions ${min} of VoxelSrv Server or newer.`);
            else if (!min && !!max && semver.gt(values_1.serverVersion, max))
                this.log.warn(`It only support versions ${max} of VoxelSrv Server or older.`);
        }
        else if (plugin.game != 'voxelsrv' && plugin.game != '*') {
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
                    if (typeof this[x][y] == 'object')
                        this[x][y] = null;
                });
                if (typeof this[x] == 'object')
                    this[x] = null;
            });
        }, 2000);
    }
    loadConfig(namespace, config) {
        if (fs.existsSync(`./config/${namespace}/${config}.json`)) {
            try {
                const data = fs.readFileSync(`./config/${namespace}/${config}.json`);
                return JSON.parse(data.toString());
            }
            catch (e) {
                this.log.error(`Invalid config file (./config/${namespace}/${config}.json)!\n${e}`);
                return {};
            }
        }
        else
            return {};
    }
    saveConfig(namespace, config, data) {
        if (!fs.existsSync(`./config/${namespace}`))
            fs.mkdirSync(`./config/${namespace}`, { recursive: true });
        fs.writeFile(`./config/${namespace}/${config}.json`, JSON.stringify(data, null, 2), function (err) {
            if (err)
                this.log.error(`Cant save config ${namespace}/${config}! Reason: ${err}`);
        });
    }
}
exports.Server = Server;
function verifyLogin(data) {
    if (data == undefined)
        return 'No data!';
    else if (data.username == undefined || values_1.invalidNicknameRegex.test(data.username))
        return 'Illegal username - ' + data.username;
    else if (data.protocol == undefined || data.protocol != values_1.serverProtocol)
        return 'Unsupported protocol';
    return 0;
}
class Console {
    constructor(s) {
        this.executor = {
            name: '#console',
            id: '#console',
            send: (...args) => this.s.log.normal(...args),
            permissions: new permissions_1.PermissionHolder({ '*': true }),
        };
        this.executorchat = { ...this.executor, send: (...args) => this.s.log.chat(...args) };
        this.s = s;
    }
}
//# sourceMappingURL=server.js.map