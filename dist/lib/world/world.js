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
exports.Chunk = exports.World = void 0;
const fs = __importStar(require("fs"));
const format = __importStar(require("../../formats/world"));
const zlib = __importStar(require("zlib"));
const util_1 = require("util");
const inflatePromise = util_1.promisify(zlib.inflate);
const readFilePromise = util_1.promisify(fs.readFile);
const ndarray = require("ndarray");
const helper_1 = require("./helper");
class World {
    constructor(name, seed, generator, ver, server) {
        this.active = false;
        this._server = server;
        this._worldMen = server.worlds;
        this.name = name;
        this.seed = seed != 0 ? seed : helper_1.getRandomSeed();
        this.generator = new server.worlds.worldGenerator[generator](this.seed, server);
        if (ver == null)
            this.version = 1;
        else
            this.version = ver;
        this.chunks = {};
        this.entities = {};
        this.folder = './worlds/' + name;
        this.chunkFolder = './worlds/' + name + '/chunks';
        if (this._server.config.world.save) {
            if (!fs.existsSync(this.folder))
                fs.mkdirSync(this.folder);
            if (!fs.existsSync(this.chunkFolder))
                fs.mkdirSync(this.chunkFolder);
            fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
                if (err)
                    this._server.log.error('Cant save world ' + this.name + '! Reason: ' + err);
            });
            this.autoSaveInterval = setInterval(async () => {
                this.saveAll();
            }, 30000);
        }
        this.chunkUnloadInterval = setInterval(async () => {
            const chunklist = Object.keys(this.chunks);
            chunklist.forEach((id) => {
                if (Date.now() - this.chunks[id].lastUse >= 5000 && !!this.chunks[id].forceload)
                    this.unloadChunk(this.stringToID(id));
            });
        }, 1000);
    }
    stringToID(id) {
        const x = id.split(',');
        return [parseInt(x[0]), parseInt(x[1])];
    }
    async getChunk(id) {
        const idS = id.toString();
        if (this.chunks[idS] != undefined && this.chunks[idS].metadata.stage > 0) {
            this.chunks[idS].keepAlive();
            return this.chunks[idS];
        }
        if (this.existChunk(id)) {
            const data = await this.readChunk(id);
            this.chunks[idS] = new Chunk(id, data.chunk, data.metadata, false);
            this.chunks[idS].keepAlive();
        }
        else {
            this.chunks[idS] = new Chunk(id, await this.generator.generateBaseChunk(id), { ...this._worldMen._baseMetadata }, false);
            this.chunks[idS].keepAlive();
        }
        if (this.chunks[idS].metadata.stage < 1) {
            await this.generator.generateChunk(id, this.chunks[idS].data, this);
            this.chunks[idS].metadata.stage = 1;
        }
        return this.chunks[idS];
    }
    getNeighborIDsChunks(id) {
        const obj = [];
        let x, z;
        for (x = id[0] - 1; x != id[0] + 2; x++) {
            for (z = id[1] - 1; z != id[1] + 2; z++) {
                obj.push([x, z]);
            }
        }
        return obj;
    }
    existChunk(id) {
        const idS = id.toString();
        const chk = fs.existsSync(this.chunkFolder + '/' + idS + '.chk');
        return chk || this.chunks[id.toString()] != undefined;
    }
    saveAll() {
        if (!this._server.config.world.save)
            return;
        const chunklist = Object.keys(this.chunks);
        fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
            if (err)
                this._server.log.error('Cant save world ' + this.name + '! Reason: ' + err);
        });
        chunklist.forEach((id) => {
            this.saveChunk(this.stringToID(id));
        });
    }
    async saveChunk(id) {
        const idS = id.toString();
        const chunk = this.chunks[idS];
        if (chunk == undefined || chunk.metadata == undefined || chunk.data == undefined)
            return;
        const message = format.chunk.create({
            blocks: Buffer.from(chunk.data.data.buffer, chunk.data.data.byteOffset),
            version: chunk.metadata.ver,
            stage: chunk.metadata.stage,
        });
        const buffer = format.chunk.encode(message).finish();
        const data = zlib.deflateSync(buffer);
        fs.writeFile(this.chunkFolder + '/' + idS + '.chk', data, function (err) {
            if (err)
                this._server.log.console.error('Cant save chunk ' + id + '! Reason: ' + err);
        });
    }
    async readChunk(id) {
        const idS = id.toString();
        const exist = this.existChunk(id);
        let chunk = null;
        let meta = null;
        if (exist) {
            const data = await readFilePromise(this.chunkFolder + '/' + idS + '.chk');
            const array = await inflatePromise(data);
            const decoded = format.chunk.decode(array);
            chunk = new ndarray(new Uint16Array(decoded.blocks.buffer, decoded.blocks.byteOffset), [
                this._worldMen.chunkWitdh,
                this._worldMen.chunkHeight,
                this._worldMen.chunkWitdh,
            ]);
            meta = { stage: decoded.stage, version: decoded.version };
        }
        return { chunk: chunk, metadata: meta };
    }
    readChunkSync(id) {
        const idS = id.toString();
        const exist = this.existChunk(id);
        let chunk = null;
        let meta = null;
        if (exist) {
            const data = fs.readFileSync(this.chunkFolder + '/' + idS + '.chk');
            const array = zlib.inflateSync(data);
            const decoded = format.chunk.decode(array);
            chunk = new ndarray(new Uint16Array(decoded.blocks.buffer, decoded.blocks.byteOffset), [
                this._worldMen.chunkWitdh,
                this._worldMen.chunkHeight,
                this._worldMen.chunkWitdh,
            ]);
            meta = { stage: decoded.stage, version: decoded.version };
        }
        return { chunk: chunk, metadata: meta };
    }
    unloadChunk(id) {
        if (this._server.config.world.save)
            this.saveChunk(id);
        delete this.chunks[id.toString()];
    }
    getSettings() {
        return {
            name: this.name,
            seed: this.seed,
            generator: this.generator.name,
            version: this.version,
        };
    }
    async getBlock(data, allowgen) {
        const local = helper_1.globalToChunk(data);
        if (this.existChunk(local.id) || allowgen) {
            return this._server.registry.blocks[this._server.registry.blockIDmap[(await this.getChunk(local.id)).data.get(local.pos[0], local.pos[1], local.pos[2])]];
        }
        return this._server.registry.blocks['air'];
    }
    getBlockSync(data, allowgen = false) {
        const local = helper_1.globalToChunk(data);
        const cid = local.id.toString();
        if (this.chunks[cid] != undefined) {
            const id = this.chunks[cid].data.get(local.pos[0], local.pos[1], local.pos[2]);
            this.chunks[cid].keepAlive();
            return this._server.registry.blocks[this._server.registry.blockIDmap[id]];
        }
        else if (this.existChunk(local.id)) {
            const data = this.readChunkSync(local.id);
            this.chunks[cid] = new Chunk(local.id, data.chunk, data.metadata, false);
            this.chunks[cid].keepAlive();
            return this._server.registry.blocks[this._server.registry.blockIDmap[this.chunks[cid].data.get(local.pos[0], local.pos[1], local.pos[2])]];
        }
        else if (allowgen) {
            return this._server.registry.blocks[this._server.registry.blockIDmap[this.generator.getBlock(data[0], data[1], data[2])]];
        }
        return this._server.registry.blocks['air'];
    }
    async setBlock(data, block, allowgen = false) {
        const local = helper_1.globalToChunk(data);
        let id = 0;
        switch (typeof block) {
            case 'number':
                id = block;
                break;
            case 'object':
                id = block.numId;
                break;
            case 'string':
                id = this._server.registry.blockPalette[block];
            default:
                return;
        }
        const chunk = await this.getChunk(local.id);
        chunk.data.set(local.pos[0], local.pos[1], local.pos[2], id);
    }
    async setRawBlock(data, block) { }
    unload() {
        this.saveAll();
        clearInterval(this.autoSaveInterval);
        clearInterval(this.chunkUnloadInterval);
        setTimeout(() => {
            delete this._worldMen.worlds[this.name];
        }, 50);
    }
}
exports.World = World;
class Chunk {
    constructor(id, blockdata, metadata, bool) {
        this.id = id;
        this.data = blockdata;
        this.metadata = metadata;
        this.lastUse = Date.now();
        this.forceload = !!bool;
    }
    set(x, y, z, id) {
        this.data.set(x, y, z, id);
    }
    get(x, y, z) {
        return this.data.get(x, y, z);
    }
    keepAlive() {
        this.lastUse = Date.now();
    }
}
exports.Chunk = Chunk;
//# sourceMappingURL=world.js.map