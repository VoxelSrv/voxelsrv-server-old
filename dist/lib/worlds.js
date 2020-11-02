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
exports.validateID = exports.getRandomSeed = exports.globalToLocal = exports.chunkIDFromGlobal = exports.globalToChunk = exports.Chunk = exports.World = exports.WorldManager = void 0;
const fs = __importStar(require("fs"));
const console = __importStar(require("./console"));
const format = __importStar(require("../formats/world"));
const pako = __importStar(require("pako"));
const ndarray = require("ndarray");
class WorldManager {
    constructor(server) {
        this.chunkWitdh = 32;
        this.chunkHeight = 256;
        this.lastChunk = 5000;
        this.worlds = {};
        this.worldgenerators = {};
        this._baseMetadata = { ver: 2, stage: 0 };
        this.server = server;
    }
    create(name, seed, generator) {
        if (this.exist(name) == false && this.worlds[name] == undefined) {
            this.worlds[name] = new World(name, seed, generator, null, this.server);
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
                this.worlds[name] = new World(name, data.seed, data.generator, data.version, this.server);
                return this.worlds[name];
            }
            else {
                return null;
            }
        }
        catch (e) {
            console.error(`Can't load world ${name}! Trying to recreate it...`);
            this.create(name, 0, 'normal');
        }
    }
    unload(name) {
        this.worlds[name].unload();
        console.log('Unloaded world ' + name);
    }
    exist(name) {
        return fs.existsSync('./worlds/' + name);
    }
    get(name) {
        return this.worlds[name];
    }
    addGenerator(name, gen) {
        this.worldgenerators[name] = gen;
    }
}
exports.WorldManager = WorldManager;
class World {
    constructor(name, seed, generator, ver, server) {
        this._server = server;
        this._worldMen = server.worlds;
        this.name = name;
        this.seed = seed != 0 ? seed : getRandomSeed();
        this.generator = new server.worlds.worldgenerators[generator](this.seed, server);
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
                    console.error('Cant save world ' + this.name + '! Reason: ' + err);
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
        const chunkIDs = this.getNeighborIDsChunks(id);
        const chunks = {};
        await chunkIDs.forEach(async (cid) => {
            chunks[cid.toString()] = await this.getRawChunk(cid, true);
        });
        if (this.chunks[idS].metadata.stage < 1) {
            await this.generator.generateChunk(id, this.chunks[idS].data, this);
            this.chunks[idS].metadata.stage = 1;
        }
        return this.chunks[idS];
    }
    async getRawChunk(id, bool) {
        const idS = id.toString();
        if (this.chunks[idS] != undefined) {
            this.chunks[idS].keepAlive();
            return this.chunks[idS];
        }
        else if (this.existChunk(id)) {
            const data = this.readChunk(id);
            this.chunks[idS] = new Chunk(id, data.chunk, data.metadata, false);
            this.chunks[idS].keepAlive();
            return this.chunks[idS];
        }
        if (bool) {
            this.chunks[idS] = new Chunk(id, await this.generator.generateBaseChunk(id), { ...this._worldMen._baseMetadata }, false);
            this.chunks[idS].keepAlive();
            return this.chunks[idS];
        }
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
        return chk;
    }
    saveAll() {
        if (!this._server.config.world.save)
            return;
        const chunklist = Object.keys(this.chunks);
        fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
            if (err)
                console.error('Cant save world ' + this.name + '! Reason: ' + err);
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
        const data = pako.deflate(buffer);
        fs.writeFile(this.chunkFolder + '/' + idS + '.chk', data, function (err) {
            if (err)
                console.error('Cant save chunk ' + id + '! Reason: ' + err);
        });
    }
    readChunk(id) {
        const idS = id.toString();
        const exist = this.existChunk(id);
        let chunk = null;
        let meta = null;
        if (exist) {
            const data = fs.readFileSync(this.chunkFolder + '/' + idS + '.chk');
            const array = pako.inflate(data);
            const decoded = format.chunk.decode(array);
            chunk = new ndarray(new Uint16Array(decoded.blocks.buffer, decoded.blocks.byteOffset), [this._worldMen.chunkWitdh, this._worldMen.chunkHeight, this._worldMen.chunkWitdh]);
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
    getBlock(data, allowgen) {
        const local = globalToChunk(data);
        const cid = local.id.toString();
        if (this.chunks[cid] != undefined) {
            const id = this.chunks[cid].data.get(local.pos[0], local.pos[1], local.pos[2]);
            this.chunks[cid].keepAlive();
            return this._server.registry.blocks[this._server.registry.blockIDmap[id]];
        }
        else if (this.existChunk(local.id)) {
            const data = this.readChunk(local.id);
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
        const local = globalToChunk(data);
        let id = 0;
        switch (typeof block) {
            case 'number':
                id = block;
                break;
            case 'object':
                id = block.rawid;
                break;
            case 'string':
                id = this._server.registry.blockPalette[block];
            default:
                return;
        }
        const chunk = await this.getChunk(local.id);
        chunk.data.set(local.pos[0], local.pos[1], local.pos[2], id);
    }
    async setRawBlock(data, block) {
        const local = globalToChunk(data);
        const chunk = await this.getRawChunk(local.id, true);
        chunk.keepAlive();
        chunk.data.set(local.pos[0], local.pos[1], local.pos[2], block);
    }
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
function globalToChunk(pos) {
    const xc = Math.floor(pos[0] / 32);
    const zc = Math.floor(pos[2] / 32);
    let xl = pos[0] % 32;
    let yl = pos[1];
    let zl = pos[2] % 32;
    if (xl < 0)
        xl = xl + 32;
    if (zl < 0)
        zl = zl + 32;
    return {
        id: [xc, zc],
        pos: [xl, yl, zl],
    };
}
exports.globalToChunk = globalToChunk;
function chunkIDFromGlobal(pos) {
    let xz = [Math.floor(pos[0] / 32), Math.floor(pos[2] / 32)];
    if (xz[0] < 0)
        xz[0] = xz[0] + 32;
    if (xz[1] < 0)
        xz[1] = xz[1] + 32;
    return xz;
}
exports.chunkIDFromGlobal = chunkIDFromGlobal;
function globalToLocal(pos) {
    return [pos[0] % 32, pos[1], pos[2] % 32];
}
exports.globalToLocal = globalToLocal;
function getRandomSeed() {
    return Math.random() * (9007199254740990 + 9007199254740990) - 9007199254740991;
}
exports.getRandomSeed = getRandomSeed;
function validateID(id) {
    if (id == null || id == undefined)
        return false;
    else if (id[0] == null || id[0] == undefined)
        return false;
    else if (id[1] == null || id[1] == undefined)
        return false;
}
exports.validateID = validateID;
//# sourceMappingURL=worlds.js.map