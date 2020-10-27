"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = exports.EntityManager = void 0;
const worlds_1 = require("./worlds");
const uuid_1 = require("uuid");
class EntityManager {
    constructor(server) {
        this._server = server;
        this._worlds = server.worlds;
    }
    create(type, data, worldName, tick) {
        let id = uuid_1.v4();
        this._worlds.get(worldName).entities[id] = new Entity(id, type, data, this._worlds.get(worldName), tick, this);
        this._server.emit('entity-create', {
            uuid: id,
            entity: this._worlds.get(worldName).entities[id],
        });
        return this._worlds.get(worldName).entities[id];
    }
    recreate(id, type, data, worldName, tick) {
        this._worlds.get(worldName).entities[id] = new Entity(id, type, data, this._worlds.get(worldName), tick, this);
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
class Entity {
    constructor(id, type, data, world, tick, entitymanager) {
        this.data = data;
        this._entities = entitymanager;
        if (data.position == undefined) {
            this.data.position = [0, 0, 0];
        }
        if (data.rotation == undefined) {
            this.data.rotation = 0;
        }
        if (data.pitch == undefined) {
            this.data.pitch = 0;
        }
        this.type = type;
        this.id = id;
        this.world = world;
        this.chunkID = worlds_1.globalToChunk(this.data.position).id;
        this.chunk = this.world.chunks[this.chunkID.toString()];
        if (tick != null)
            this.tick = tick;
        else
            this.tick = function () { };
    }
    getObject() {
        return {
            data: {
                position: this.data.position,
                rotation: this.data.rotation,
                pitch: this.data.pitch,
                health: this.data.health,
                maxHealth: this.data.maxHealth,
                model: this.data.model,
                texture: this.data.texture,
                name: this.data.name,
                nametag: this.data.nametag,
                hitbox: this.data.hitbox,
                armor: this.data.armor.getObject()
            },
            id: this.id,
            world: this.world.name,
            type: this.type,
            chunk: this.chunkID,
        };
    }
    teleport(pos, eworld) {
        this.world = typeof eworld == 'string' ? this._entities._worlds.get(eworld) : eworld;
        this.data.position = pos;
        this.chunkID = worlds_1.globalToChunk(pos).id;
        this.chunk = this.world.chunks[this.chunkID.toString()];
        this.world._server.emit('entity-move', {
            uuid: this.id,
            x: this.data.position[0],
            y: this.data.position[1],
            z: this.data.position[2],
            rotation: this.data.rotation,
            pitch: this.data.pitch,
        });
    }
    move(pos) {
        this.data.position = pos;
        this.chunkID = worlds_1.globalToChunk(pos).id;
        this.chunk = this.world.chunks[this.chunkID.toString()];
        this.world._server.emit('entity-move', {
            uuid: this.id,
            x: this.data.position[0],
            y: this.data.position[1],
            z: this.data.position[2],
            rotation: this.data.rotation,
            pitch: this.data.pitch,
        });
    }
    rotate(rot, pitch) {
        this.data.rotation = rot;
        this.data.pitch = pitch;
        this.world._server.emit('entity-move', {
            uuid: this.id,
            x: this.data.position[0],
            y: this.data.position[1],
            z: this.data.position[2],
            rotation: this.data.rotation,
            pitch: this.data.pitch,
        });
    }
    remove() {
        try {
            let id = this.id;
            this.world._server.emit('entity-remove', { uuid: this.id });
            setTimeout(() => {
                if (this.world.entities[id] != undefined)
                    delete this.world.entities[id];
            }, 10);
        }
        catch (e) {
            console.log("Server tried to remove entity, but it didn't work! Error: ", e);
        }
    }
    getID() {
        return this.id;
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map