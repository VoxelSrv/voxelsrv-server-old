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
const biome = __importStar(require("./parts/biomes"));
const ndarray = require("ndarray");
class FlatGenerator {
    constructor(seed, server) {
        this.name = 'flat';
        this.chunkWitdh = 32;
        this.chunkHeight = 256;
        this._lastWorkerUsed = 0;
        this._server = server;
        this.seed = seed;
        this.blocks = server.registry.blockPalette;
        this.biome = new biome.BaseBiome(this.blocks, {}, seed);
    }
    getBlock(x, y, z, biomes) {
        return y > 50 ? this.blocks.air : y == 50 ? this.blocks.grass : y > 45 ? this.blocks.dirt : y == 0 ? this.blocks.bedrock : this.blocks.stone;
    }
    getBiome(x, z) {
        return this.biome;
    }
    getBiomesAt(x, z) {
        const possible = {};
        possible[this.biome.id] = 1;
        return {
            main: this.biome,
            possible,
            height: 60,
            size: 1,
        };
    }
    async generateBaseChunk(id, chunkignore) {
        const xoff = id[0] * this.chunkWitdh;
        const zoff = id[1] * this.chunkWitdh;
        let x, y, z;
        const chunk = new ndarray(new Uint16Array(this.chunkWitdh * this.chunkHeight * this.chunkWitdh), [this.chunkWitdh, this.chunkHeight, this.chunkWitdh]);
        for (x = 0; x < this.chunkWitdh; x++) {
            for (z = 0; z < this.chunkWitdh; z++) {
                for (y = 0; y <= 70; y++) {
                    chunk.set(x, y, z, this.getBlock(x + xoff, y, z + zoff, null));
                }
            }
        }
        return chunk;
    }
    async generateChunk(id, chunk, world) {
    }
}
exports.default = FlatGenerator;
function delay(t) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('');
        }, t);
    });
}
//# sourceMappingURL=flat.js.map