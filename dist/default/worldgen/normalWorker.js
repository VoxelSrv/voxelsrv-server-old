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
const murmur_numbers_1 = __importDefault(require("murmur-numbers"));
const biome = __importStar(require("./parts/biomes"));
const ndarray = require("ndarray");
const worker_1 = require("threads/worker");
function getHighestBlock(chunk, x, z) {
    for (let y = 256 - 1; y >= 0; y = y - 1) {
        const val = chunk.get(x, y, z);
        if (val != 0)
            return { level: y, block: val };
    }
    return null;
}
let generator;
const x = {
    setupGenerator(seed, blocks) {
        generator = new NormalGenerator(seed, blocks);
    },
    generateBaseChunk(id, chunk) {
        const data = generator.generateBaseChunk(id, chunk);
        return data.data;
    },
    getBiomesAt(x, z) {
        return generator.getBiomesAt(x, z);
    },
};
worker_1.expose(x);
class NormalGenerator {
    constructor(seed, blocks) {
        this.chunkWitdh = 32;
        this.chunkHeight = 256;
        this.waterLevel = 65;
        this.biomeSpacing = 100;
        this.features = {
            oakTree: -1,
            birchTree: -2,
            cactus: -3,
            spruceTree: -4,
            yellowOakTree: -5,
        };
        this.seed = seed;
        this.biomeNoise1 = open_simplex_noise_1.makeNoise2D(Math.round(seed * Math.sin(seed ^ 3) * 10000));
        this.biomeNoise2 = open_simplex_noise_1.makeNoise2D(Math.round(seed * Math.sin(seed ^ 4) * 10000));
        this.biomeNoise3 = open_simplex_noise_1.makeNoise2D(Math.round(seed * Math.sin(seed ^ 5) * 10000));
        this.caveNoise1 = open_simplex_noise_1.makeNoise3D(Math.round(seed * Math.cos(seed ^ 5) * 10000));
        this.caveNoise2 = open_simplex_noise_1.makeNoise3D(Math.round(seed * Math.cos(seed ^ 2) * 10000));
        this.plantSeed = Math.round(seed * Math.sin(seed ^ 6) * 10000);
        this.blocks = blocks;
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
            savanna: new biome.SavannaBiome(this.blocks, this.features, seed),
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
        const rand = this.hash(200, x, z) / 90;
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
        else if (heat > 1.4) {
            return this.biomes.desert;
        }
        else if (heat > 0.5) {
            if (wierdness > 1.5)
                return this.biomes.mountains;
            else if (wierdness > 1.3)
                return this.biomes.forest;
            return this.biomes.plains;
        }
        else if (heat <= 0.6) {
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
    generateBaseChunk(id, chunk) {
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
}
function dist2(x, z) {
    return Math.sqrt(x * x + z * z);
}
//# sourceMappingURL=normalWorker.js.map