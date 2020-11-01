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
const open_simplex_noise_1 = require("open-simplex-noise");
const tree = __importStar(require("./parts/tree"));
const murmur_numbers_1 = __importDefault(require("murmur-numbers"));
const biome = __importStar(require("./parts/biomes"));
const ndarray = require("ndarray");
function getHighestBlock(chunk, x, z) {
    for (let y = 256 - 1; y >= 0; y = y - 1) {
        const val = chunk.get(x, y, z);
        if (val != 0)
            return { level: y, block: val };
    }
    return null;
}
class NormalGenerator {
    constructor(seed, server) {
        this.name = 'normal';
        this.chunkWitdh = 32;
        this.chunkHeight = 256;
        this.waterLevel = 65;
        this.biomeSpacing = 100;
        this.features = {
            oakTree: -1,
            birchTree: -2,
            cactus: -3,
        };
        this._server = server;
        this.seed = seed;
        this.biomeNoise1 = open_simplex_noise_1.makeNoise2D(Math.round(seed * Math.sin(seed ^ 3) * 10000));
        this.biomeNoise2 = open_simplex_noise_1.makeNoise2D(Math.round(seed * Math.sin(seed ^ 4) * 10000));
        this.biomeNoise3 = open_simplex_noise_1.makeNoise2D(Math.round(seed * Math.sin(seed ^ 5) * 10000));
        this.caveNoise1 = open_simplex_noise_1.makeNoise3D(Math.round(seed * Math.cos(seed ^ 5) * 10000));
        this.caveNoise2 = open_simplex_noise_1.makeNoise3D(Math.round(seed * Math.cos(seed ^ 2) * 10000));
        this.plantSeed = Math.round(seed * Math.sin(seed ^ 6) * 10000);
        this.blocks = server.registry.blockPalette;
        this.hash = murmur_numbers_1.default(this.plantSeed);
        this.biomes = {
            mountains: new biome.MountainsBiome(this.blocks, this.features, seed),
            plains: new biome.PlainsBiome(this.blocks, this.features, seed),
            desert: new biome.DesertBiome(this.blocks, this.features, seed),
            forest: new biome.ForestBiome(this.blocks, this.features, seed),
            iceplains: new biome.IcePlainsBiome(this.blocks, this.features, seed),
            icemountains: new biome.IceMountainsBiome(this.blocks, this.features, seed),
            ocean: new biome.OceanBiome(this.blocks, this.features, seed),
            beach: new biome.BeachBiome(this.blocks, this.features, seed),
        };
    }
    getBlock(x, y, z, biomes) {
        let value = 0;
        let key = '';
        for (key in biomes.possible) {
            value = value + this.biomes[key].getHeightMap(x, y, z) * biomes.possible[key];
        }
        value = value / biomes.size;
        return y <= value ? this.blocks.stone : y <= this.waterLevel ? this.blocks.water : 0;
    }
    getBiome(x, z) {
        const rand = this.hash(200, x, z) / 100;
        const wierdness = this.biomeNoise1(x / 600, z / 600) + 1 + rand;
        const heat = this.biomeNoise2(x / 300, z / 300) + 1 + rand;
        const water = this.biomeNoise3(x / 400, z / 400) + 1 + rand;
        if (water > 1.3)
            return this.biomes.ocean;
        else if (water > 1.15) {
            if (wierdness > 1.5)
                return this.biomes.mountains;
            return this.biomes.beach;
        }
        else if (heat > 1.5) {
            return this.biomes.desert;
        }
        else if (heat > 0.5) {
            if (wierdness > 1.5)
                return this.biomes.mountains;
            else if (wierdness > 1.3)
                return this.biomes.forest;
            return this.biomes.plains;
        }
        else if (heat <= 0.5) {
            if (wierdness > 1.5)
                return this.biomes.icemountains;
            return this.biomes.iceplains;
        }
    }
    getBiomesAt(x, z) {
        const main = this.getBiome(x, z);
        let x1;
        let z1;
        const possible = {};
        let biome;
        let height = 0;
        let size = 0;
        for (x1 = -10; x1 <= 10; x1++) {
            for (z1 = -10; z1 <= 10; z1++) {
                if (dist2(x1, z1) > 10)
                    continue;
                biome = this.getBiome(x + x1, z + z1);
                if (possible[biome.id] == undefined)
                    possible[biome.id] = 0;
                possible[biome.id] = possible[biome.id] + 1;
                if (height < biome.height)
                    height = biome.height;
                size = size + 1;
            }
        }
        return {
            main,
            possible,
            height,
            size,
        };
    }
    async generateBaseChunk(id, chunk) {
        const xoff = id[0] * this.chunkWitdh;
        const zoff = id[1] * this.chunkWitdh;
        let x, y, z;
        let biomes;
        let chunkTemp = new ndarray(new Uint16Array(this.chunkWitdh * this.chunkHeight * this.chunkWitdh), [
            this.chunkWitdh,
            this.chunkHeight,
            this.chunkWitdh,
        ]);
        for (x = 0; x < this.chunkWitdh; x++) {
            for (z = 0; z < this.chunkWitdh; z++) {
                biomes = this.getBiomesAt(x + xoff, z + zoff);
                for (y = 0; y <= biomes.height; y++) {
                    chunkTemp.set(x, y, z, this.getBlock(x + xoff, y, z + zoff, biomes));
                }
            }
        }
        return chunkTemp;
    }
    async generateChunk(id, chunk, world) {
        const xoff = id[0] * this.chunkWitdh;
        const zoff = id[1] * this.chunkWitdh;
        let x, y, z;
        let block;
        let biome;
        let chunkBase = new ndarray(new Uint16Array(chunk.data.slice(0)), [this.chunkWitdh, this.chunkHeight, this.chunkWitdh]);
        function get(y1) {
            return chunkBase.get(x, y1, z);
        }
        for (x = 0; x < this.chunkWitdh; x++) {
            for (z = 0; z < this.chunkWitdh; z++) {
                biome = this.getBiome(x + xoff, z + zoff);
                for (y = 0; y <= 200; y++) {
                    block = biome.getBlock(x + xoff, y, z + zoff, get);
                    if (block > 0) {
                        chunk.set(x, y, z, block);
                    }
                    else if (block < 0) {
                        if (block == this.features.oakTree)
                            await pasteStructure(chunk, tree.oakTree(murmur_numbers_1.default(x + xoff, z + zoff) * 1000, this.hash, this.blocks), x, y, z, id, world);
                        else if (block == this.features.birchTree)
                            await pasteStructure(chunk, tree.birchTree(murmur_numbers_1.default(x + xoff, z + zoff) * 1000, this.hash, this.blocks), x, y, z, id, world);
                        else if (block == this.features.cactus) {
                            chunk.set(x, y, z, this.blocks.cactus);
                            chunk.set(x, y + 1, z, this.blocks.cactus);
                            if (murmur_numbers_1.default(x, z) > 0.5)
                                chunk.set(x, y + 2, z, this.blocks.cactus);
                        }
                    }
                }
            }
        }
    }
}
exports.default = NormalGenerator;
async function pasteStructure(chunk, gen, x, y, z, id, world) {
    const xm = Math.round(gen.shape[0] / 2);
    const zm = Math.round(gen.shape[2] / 2);
    let alt = false;
    for (var i = 0; i < gen.shape[0]; i++) {
        // x
        let x2 = x - xm + i;
        if (x2 >= chunk.shape[0] || x2 < 0)
            alt = true;
        for (var k = 0; k < gen.shape[2]; k++) {
            // z
            let z2 = z - zm + k;
            if (z2 >= chunk.shape[2] || z2 < 0)
                alt = true;
            if (alt) {
                alt = false;
                for (var j = 0; j < gen.shape[1]; j++) {
                    // y
                    if (gen.get(i, j, k) != 0) {
                        await world.setRawBlock([id[0] * 32 + x2, y + j, id[1] * 32 + z2], gen.get(i, j, k));
                    }
                }
            }
            else {
                for (var j = 0; j < gen.shape[1]; j++) {
                    // y
                    if (gen.get(i, j, k) != 0) {
                        chunk.set(x2, y + j, z2, gen.get(i, j, k));
                    }
                }
            }
        }
    }
}
function dist2(x, z) {
    return Math.sqrt(x * x + z * z);
}
//# sourceMappingURL=normal.js.map