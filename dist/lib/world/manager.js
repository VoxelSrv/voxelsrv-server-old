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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityManager = exports.WorldManager = void 0;
const fs = __importStar(require("fs"));
const world_1 = require("./world");
const entity_1 = require("./entity");
const uuid_1 = require("uuid");
class WorldManager {
    constructor(server) {
        this.chunkWitdh = 32;
        this.chunkHeight = 256;
        this.lastChunk = 5000;
        this.worlds = {};
        this.worldGenerator = {};
        this._baseMetadata = { ver: 2, stage: 0 };
        this._server = server;
    }
    create(name, seed, generator) {
        if (this.exist(name) == false && this.worlds[name] == undefined) {
            this.worlds[name] = new world_1.World(name, seed, generator, null, this._server);
            return this.worlds[name];
        }
        else {
            return null;
        }
    }
    load(name) {
        try {
            if (this.exist(name) == true && this.worlds[name] == undefined) {
                const readed = fs.readFileSync('./worlds/' + name + '/world.json');
                const data = JSON.parse(readed.toString());
                this.worlds[name] = new world_1.World(name, data.seed, data.generator, data.version, this._server);
                return this.worlds[name];
            }
            else {
                return null;
            }
        }
        catch (e) {
            this._server.log.error(`Can't load world ${name}! Trying to recreate it...`);
            this.create(name, 0, 'normal');
        }
    }
    unload(name) {
        this.worlds[name].unload();
        this._server.log.normal('Unloaded world ' + name);
    }
    exist(name) {
        return fs.existsSync('./worlds/' + name);
    }
    get(name) {
        return this.worlds[name];
    }
    addGenerator(name, gen) {
        this.worldGenerator[name] = gen;
    }
}
exports.WorldManager = WorldManager;
class EntityManager {
    constructor(server) {
        this._server = server;
        this._worlds = server.worlds;
    }
    create(type, data, worldName, tick) {
        let id = uuid_1.v4();
        this._worlds.get(worldName).entities[id] = new entity_1.Entity(id, type, data, this._worlds.get(worldName), tick, this);
        this._server.emit('entity-create', {
            uuid: id,
            entity: this._worlds.get(worldName).entities[id],
        });
        return this._worlds.get(worldName).entities[id];
    }
    recreate(id, type, data, worldName, tick) {
        this._worlds.get(worldName).entities[id] = new entity_1.Entity(id, type, data, this._worlds.get(worldName), tick, this);
        this._server.emit('entity-create', {
            uuid: id,
            entity: this._worlds.get(worldName).entities[id],
        });
        return this._worlds.get(worldName).entities[id];
    }
    get(world, id) {
        if (!this._worlds.get(world))
            return null;
        return this._worlds.get(world).entities[id];
    }
    getAll(world) {
        if (!this._worlds.get(world))
            return null;
        return this._worlds.get(world).entities;
    }
}
exports.EntityManager = EntityManager;
//# sourceMappingURL=manager.js.map