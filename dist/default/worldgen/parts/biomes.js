"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeachBiome = exports.OceanBiome = exports.IceMountainsBiome = exports.MountainsBiome = exports.DesertBiome = exports.ForestBiome = exports.IcePlainsBiome = exports.PlainsBiome = exports.BaseBiome = void 0;
const open_simplex_noise_1 = require("open-simplex-noise");
const murmur_numbers_1 = __importDefault(require("murmur-numbers"));
class BaseBiome {
    constructor(blocks, feature, seed) {
        this.id = 'base';
        this.block = {};
        this.height = 100;
        this.feature = {};
        this.block = blocks;
        this.feature = feature;
        this.heightNoise = open_simplex_noise_1.makeNoise2D(Math.round(seed * 60 * Math.sin(seed ^ 3) * 10000));
        this.heightNoise2 = open_simplex_noise_1.makeNoise2D(Math.round(seed * 60 * 10000));
        this.caveNoise = open_simplex_noise_1.makeNoise3D(Math.round(seed * Math.sin(seed ^ 2) * 10000));
        this.caveNoise2 = open_simplex_noise_1.makeNoise3D(Math.round(seed * 10000));
        this.hash = murmur_numbers_1.default(seed ^ (2 * 10000));
        this.hash2 = murmur_numbers_1.default(seed * 3 * 10000);
    }
    getBlock(x, y, z, get) {
        if (get(x, y, z)) {
            return this.block.stone;
        }
    }
    getHeightMap(x, y, z) {
        return Math.floor(this.heightNoise(x / 140, z / 140) + 1) * 5 + 50;
    }
    validate(x, z) {
        return true;
    }
}
exports.BaseBiome = BaseBiome;
class PlainsBiome extends BaseBiome {
    constructor(blocks, feature, seed) {
        super(blocks, feature, seed);
        this.id = 'plains';
        this.height = 120;
        this.mountainNoise = open_simplex_noise_1.makeNoise2D(seed * 5238 + 132);
    }
    getBlock(x, y, z, get) {
        const block = get(y);
        const upBlock = get(y + 1);
        const up3Block = get(y + 3);
        const bottomBlock = get(y - 1);
        if (y == 0)
            return this.block.bedrock;
        if (block == this.block.stone) {
            if (upBlock == 0)
                return this.block.grass;
            else if (upBlock == this.block.stone && up3Block != this.block.stone)
                return this.block.dirt;
            else if (upBlock == this.block.water)
                return this.block.dirt;
            else
                return this.block.stone;
        }
        else if (bottomBlock == this.block.stone && block == 0) {
            if (this.hash2(x, z) >= 0.9995)
                return this.feature.oakTree;
            else if (this.hash2(x, z) <= 0.00005)
                return this.feature.birchTree;
            else if (this.hash(x, z) <= 0.06)
                return this.hash(x, y, z) <= 0.5 ? this.block.red_flower : this.block.yellow_flower;
            else if (this.hash(x, z) >= 0.85)
                return this.block.grass_plant;
        }
        return this.block.air;
    }
    getHeightMap(x, y, z) {
        const dim = this.caveNoise(x / 70, y / 70, z / 70);
        const dim2 = this.caveNoise2(x / 40, y / 40, z / 40);
        const layer1 = this.heightNoise(x / 120, z / 120) + 0.4;
        const layer2 = this.heightNoise2(x / 10, z / 10);
        const mountain = this.mountainNoise(x / 60, z / 60) + 1;
        const h = layer1 + (layer2 + 1) / 4;
        //lerp(noise1, noise2, clamp(noiseBlend * blendAmplitide)) * mainAmplitude
        //const r = (dim * (1 - layer1) + dim2 * layer1) * (60 * Math.abs(layer2)) + 50;
        //const r = Math.floor((dim + dim2 + layer1 + layer2 - 3) / 8) + 50
        //const r = Math.floor((dim * 30 + dim2 * 20 + layer1 * 20 + layer2 * 10 - 3) / 65) + 50
        return (dim * (1 - h) + dim2 * h) * 14 * mountain + 70;
    }
}
exports.PlainsBiome = PlainsBiome;
class IcePlainsBiome extends PlainsBiome {
    constructor() {
        super(...arguments);
        this.id = 'iceplains';
    }
    getBlock(x, y, z, get) {
        const block = get(y);
        const upBlock = get(y + 1);
        const up3Block = get(y + 3);
        const bottomBlock = get(y - 1);
        if (y == 0)
            return this.block.bedrock;
        if (block == this.block.stone) {
            if (upBlock == 0)
                return this.block.grass_snow;
            if (upBlock == this.block.water)
                return this.block.dirt;
            else if (upBlock == this.block.stone && up3Block != this.block.stone)
                return this.block.dirt;
            else if (upBlock == this.block.water)
                return this.block.dirt;
            else
                return this.block.stone;
        }
        else if (bottomBlock == this.block.stone && block == 0) {
        }
        else if (bottomBlock == this.block.stone && block == this.block.water && upBlock == 0 && get(y - 2) == this.block.stone) {
            return this.block.ice;
        }
        return this.block.air;
    }
}
exports.IcePlainsBiome = IcePlainsBiome;
class ForestBiome extends BaseBiome {
    constructor(blocks, feature, seed) {
        super(blocks, feature, seed);
        this.id = 'forest';
        this.height = 120;
        this.mountainNoise = open_simplex_noise_1.makeNoise2D(seed * 5238 + 132);
    }
    getBlock(x, y, z, get) {
        const block = get(y);
        const upBlock = get(y + 1);
        const up3Block = get(y + 3);
        const bottomBlock = get(y - 1);
        if (y == 0)
            return this.block.bedrock;
        if (block == this.block.stone) {
            if (upBlock == 0)
                return this.block.grass;
            if (upBlock == this.block.water)
                return this.block.dirt;
            else if (upBlock == this.block.stone && up3Block != this.block.stone)
                return this.block.dirt;
            else
                return this.block.stone;
        }
        else if (bottomBlock == this.block.stone && block == 0) {
            if (this.hash2(x, z) >= 0.993)
                return this.feature.oakTree;
            else if (this.hash2(x, z) <= 0.002)
                return this.feature.birchTree;
            else if (this.hash(x, z) <= 0.06)
                return this.hash(x, y, z) <= 0.5 ? this.block.red_flower : this.block.yellow_flower;
            else if (this.hash(x, z) >= 0.85)
                return this.block.grass_plant;
        }
        return this.block.air;
    }
    getHeightMap(x, y, z) {
        const dim = this.caveNoise(x / 70, y / 70, z / 70);
        const dim2 = this.caveNoise2(x / 40, y / 40, z / 40);
        const layer1 = this.heightNoise(x / 120, z / 120);
        const layer2 = this.heightNoise2(x / 10, z / 10);
        const mountain = this.mountainNoise(x / 60, z / 60) + 1;
        const h = layer1 + (layer2 + 1) / 4;
        return (dim * (1 - h) + dim2 * h) * (14 + mountain * 10) + 72;
    }
}
exports.ForestBiome = ForestBiome;
class DesertBiome extends BaseBiome {
    constructor(blocks, feature, seed) {
        super(blocks, feature, seed);
        this.id = 'desert';
        this.height = 120;
        this.mountainNoise = open_simplex_noise_1.makeNoise2D(seed * 5238 + 132);
    }
    getBlock(x, y, z, get) {
        const block = get(y);
        const upBlock = get(y + 1);
        const up3Block = get(y + 3);
        const up6Block = get(y + 6);
        const bottomBlock = get(y - 1);
        if (y == 0)
            return this.block.bedrock;
        else if (block == this.block.stone) {
            if (upBlock == this.block.water || upBlock == this.block.air)
                return this.block.sand;
            else if (upBlock && !up3Block)
                return this.block.sand;
            else if (upBlock == this.block.stone && !up6Block)
                return this.block.sandstone;
            else
                return this.block.stone;
        }
        else if (bottomBlock == this.block.stone && block == 0) {
            if (this.hash2(x, z) <= 0.01)
                return this.feature.cactus;
            else if (this.hash(x, z) <= 0.006)
                return this.block.deadbush;
        }
        return this.block.air;
    }
    getHeightMap(x, y, z) {
        const dim = this.caveNoise(x / 70, y / 70, z / 70);
        const dim2 = this.caveNoise2(x / 40, y / 40, z / 40) + 0.2;
        const layer1 = this.heightNoise(x / 120, z / 120);
        const mountain = this.mountainNoise(x / 60, z / 60) + 1;
        return Math.abs(dim * (1 - layer1) + dim2 * layer1) * 24 * mountain + 73;
    }
}
exports.DesertBiome = DesertBiome;
class MountainsBiome extends BaseBiome {
    constructor(blocks, feature, seed) {
        super(blocks, feature, seed);
        this.id = 'mountains';
        this.height = 240;
        this.hightVariationNoise = open_simplex_noise_1.makeNoise2D(seed ^ (2 + 1));
    }
    getBlock(x, y, z, get) {
        const block = get(y);
        const upBlock = get(y + 1);
        const up2Block = get(y + 2);
        const up3Block = get(y + 3);
        const bottomBlock = get(y - 1);
        if (y == 0)
            return this.block.bedrock;
        if (block == this.block.stone) {
            if (y > 135 + this.hash(x, z) * 6) {
                if (upBlock == 0 || (upBlock == this.block.stone && up2Block == 0))
                    return this.block.snow;
            }
            else if (y > 115 + this.hash(x, z) * 7) {
                if (upBlock == 0)
                    return this.hash(x, y, z) <= 0.1 ? this.block.cobblestone : this.block.stone;
            }
            else if (upBlock == 0)
                return this.block.grass;
            else if (upBlock == this.block.stone && up3Block != this.block.stone)
                return this.block.dirt;
            else if (upBlock == this.block.water)
                return this.block.dirt;
            return this.block.stone;
        }
        else if (bottomBlock == this.block.stone && block == 0) {
            if (y > 120)
                return this.block.air;
            if (this.hash(x, z) <= 0.03)
                return this.hash(x, y, z) <= 0.5 ? this.block.red_flower : this.block.yellow_flower;
            else if (this.hash(x, z) >= 0.85)
                return this.block.grass_plant;
        }
        return this.block.air;
    }
    getHeightMap(x, y, z) {
        const dim = this.caveNoise(x / 180, y / 80, z / 180);
        const dim2 = this.caveNoise(x / 20, y / 20, z / 20);
        const mountaines = Math.abs(this.heightNoise(x / 80, z / 80));
        const layer = this.heightNoise(x / 5, z / 5) + 1;
        const layer2 = this.heightNoise2(x / 10, z / 10) + 1;
        return minNegative(mountaines - (dim * dim2) / 2) * 100 + layer * 2 + layer2 * 3 + 80;
    }
}
exports.MountainsBiome = MountainsBiome;
class IceMountainsBiome extends MountainsBiome {
    constructor() {
        super(...arguments);
        this.id = 'icemountains';
    }
    getBlock(x, y, z, get) {
        const block = get(y);
        const upBlock = get(y + 1);
        const up2Block = get(y + 2);
        const up3Block = get(y + 3);
        const bottomBlock = get(y - 1);
        if (y == 0)
            return this.block.bedrock;
        if (block == this.block.stone) {
            if (y > 135 + this.hash(x, z) * 6) {
                if (upBlock == 0 || (upBlock == this.block.stone && up2Block == 0))
                    return this.block.snow;
            }
            else if (y > 115 + this.hash(x, z) * 7) {
                if (upBlock == 0)
                    return this.hash(x, y, z) <= 0.1 ? this.block.cobblestone : this.block.snow;
            }
            else if (upBlock == 0)
                return this.block.grass_snow;
            else if (upBlock == this.block.stone && up3Block != this.block.stone)
                return this.block.dirt;
            else if (upBlock == this.block.water)
                return this.block.dirt;
            return this.block.stone;
        }
        else if (bottomBlock == this.block.stone && block == 0) {
        }
        else if (bottomBlock == this.block.stone && block == this.block.water && upBlock == 0 && get(y - 2) == this.block.stone) {
            return this.block.ice;
        }
        return this.block.air;
    }
}
exports.IceMountainsBiome = IceMountainsBiome;
class OceanBiome extends BaseBiome {
    constructor() {
        super(...arguments);
        this.id = 'ocean';
        this.height = 90;
    }
    getBlock(x, y, z, get) {
        const block = get(y);
        const upBlock = get(y + 1);
        const up3Block = get(y + 3);
        const bottomBlock = get(y - 1);
        if (y == 0)
            return this.block.bedrock;
        if (block == this.block.stone) {
            if (upBlock == this.block.water || upBlock == this.block.air)
                return this.block.gravel;
            else if (upBlock == this.block.stone && up3Block != this.block.stone)
                return this.block.gravel;
            else
                return this.block.stone;
        }
        else if (bottomBlock == this.block.stone && block == 0) {
        }
        return this.block.air;
    }
    getHeightMap(x, y, z) {
        const dim = this.caveNoise(x / 70, y / 70, z / 70);
        const dim2 = this.caveNoise(x / 40, y / 40, z / 40);
        const layer1 = this.heightNoise(x / 120, z / 120) + 0.4;
        const layer2 = this.heightNoise(x / 10, z / 10) + 0.1;
        const h = layer1 + (layer2 + 1) / 3;
        return (dim * (1 - h) + dim2 * h) * 14 + 50;
    }
}
exports.OceanBiome = OceanBiome;
class BeachBiome extends BaseBiome {
    constructor() {
        super(...arguments);
        this.id = 'beach';
        this.height = 100;
    }
    getBlock(x, y, z, get) {
        const block = get(y);
        const upBlock = get(y + 1);
        const up3Block = get(y + 3);
        const up6Block = get(y + 6);
        const bottomBlock = get(y - 1);
        if (y == 0)
            return this.block.bedrock;
        if (block == this.block.stone) {
            if (upBlock == this.block.water || upBlock == this.block.air)
                return this.block.sand;
            else if (upBlock == this.block.stone && up3Block != this.block.stone)
                return this.block.sand;
            else if (upBlock == this.block.stone && !up6Block)
                return this.block.sandstone;
            else
                return this.block.stone;
        }
        else if (bottomBlock == this.block.stone && block == 0) {
        }
        return this.block.air;
    }
    getHeightMap(x, y, z) {
        const dim = this.caveNoise(x / 70, y / 70, z / 70);
        const dim2 = this.caveNoise(x / 40, y / 40, z / 40);
        const layer1 = this.heightNoise(x / 120, z / 120) + 0.4;
        const layer2 = this.heightNoise(x / 10, z / 10) + 0.1;
        const h = layer1 + (layer2 + 1) / 3;
        return (dim * (1 - h) + dim2 * h) * 8 + 66;
    }
}
exports.BeachBiome = BeachBiome;
function minNegative(x) {
    return x > 0 ? x : x / 3;
}
//# sourceMappingURL=biomes.js.map