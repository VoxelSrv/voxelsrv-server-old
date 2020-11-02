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
const console = __importStar(require("./lib/console"));
const worlds_1 = require("./lib/worlds");
const entity_1 = require("./lib/entity");
const permissions_1 = require("./lib/permissions");
const configs = __importStar(require("./lib/configs"));
const player_1 = require("./lib/player");
const chat = __importStar(require("./lib/chat"));
const semver = __importStar(require("semver"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const normal_1 = __importDefault(require("./default/worldgen/normal"));
//import flatGenerator from './default/worldgen/flat';
const values_1 = require("./values");
class Server extends events_1.EventEmitter {
    constructor() {
        super();
        this.playerCount = 0;
        this.status = 'none';
        this.plugins = {};
        this.setMaxListeners(200);
        this.status = 'starting';
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
        console.log(`^yStarting VoxelSRV server version^: ${values_1.serverVersion} ^y[Protocol:^: ${values_1.serverProtocol}^y]`);
        ['./plugins', './players', './worlds', './config'].forEach((element) => {
            if (!fs.existsSync(element)) {
                try {
                    fs.mkdirSync(element);
                    console.log(`^BCreated missing directory: ^w${element}`);
                }
                catch (e) {
                    console.log(`^rCan't create directory: ^w${element}! Reason: ${e}`);
                    process.exit();
                }
            }
        });
        this.config = { ...values_1.serverDefaultConfig, ...configs.load('', 'config') };
        this.permissions.loadGroups(configs.load('', 'permissions'));
        configs.save('', 'config', this.config);
        this.emit('config-update', this.config);
        if (this.config.consoleInput) {
            Promise.resolve().then(() => __importStar(require('./lib/console-exec'))).then((x) => {
                x.startCmd(this.registry.commands);
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
        console.log('^yServer started on port: ^:' + this.config.port);
    }
    heartbeatPing() {
        node_fetch_1.default(`http://${values_1.heartbeatServer}/addServer?ip=${this.config.address}:${this.config.port}`)
            .then((res) => res.json())
            .then((json) => {
            this.heartbeatID = json.id;
        });
    }
    async connectPlayer(socket) {
        if (this.status != 'active')
            return;
        socket.send('LoginRequest', {
            name: this.config.name,
            motd: this.config.motd,
            protocol: values_1.serverProtocol,
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
            if (data.username == '' || data.username == null || data.username == undefined)
                data.username = 'Player' + Math.round(Math.random() * 100000);
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
                console.error(`Can't load plugin ${file}!`);
                console.obj(e);
            }
        }
    }
    loadPlugin(plugin) {
        if (!semver.satisfies(values_1.serverVersion, plugin.supported)) {
            console.warn([
                new chat.ChatComponent('Plugin ', 'orange'),
                new chat.ChatComponent(plugin.name, 'yellow'),
                new chat.ChatComponent(' might not support this version of server!', 'orange'),
            ]);
            const min = semver.minVersion(plugin.supported);
            const max = semver.maxSatisfying(plugin.supported);
            if (!!min && !!max && (semver.gt(values_1.serverVersion, max) || semver.lt(values_1.serverVersion, min)))
                console.warn(`It only support versions from ${min} to ${max}.`);
            else if (!!min && !max && semver.lt(values_1.serverVersion, min))
                console.warn(`It only support versions ${min} or newer.`);
            else if (!min && !!max && semver.gt(values_1.serverVersion, max))
                console.warn(`It only support versions ${max} or older.`);
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
                    if (typeof this[x][y] == 'object')
                        this[x][y] = null;
                });
                if (typeof this[x] == 'object')
                    this[x] = null;
            });
        }, 2000);
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
//# sourceMappingURL=server.js.map