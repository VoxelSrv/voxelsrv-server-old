import { Noise2D, Noise3D } from 'open-simplex-noise';
import hash from 'murmur-numbers';
export declare class BaseBiome {
    id: string;
    block: {
        [index: string]: number;
    };
    heightNoise: Noise2D;
    heightNoise2: Noise2D;
    caveNoise: Noise3D;
    caveNoise2: Noise3D;
    seed: number;
    hash: hash;
    hash2: hash;
    height: number;
    feature: {
        [index: string]: number;
    };
    constructor(blocks: any, feature: any, seed: number);
    getBlock(x: number, y: number, z: number, get: Function): number;
    getHeightMap(x: number, y: number, z: number): number;
    validate(x: number, z: number): boolean;
}
export declare class PlainsBiome extends BaseBiome {
    id: string;
    height: number;
    mountainNoise: Noise2D;
    constructor(blocks: any, feature: any, seed: any);
    getBlock(x: number, y: number, z: number, get: Function): number;
    getHeightMap(x: number, y: number, z: number): number;
}
export declare class IcePlainsBiome extends PlainsBiome {
    id: string;
    getBlock(x: number, y: number, z: number, get: Function): number;
}
export declare class ForestBiome extends BaseBiome {
    id: string;
    height: number;
    mountainNoise: Noise2D;
    constructor(blocks: any, feature: any, seed: any);
    getBlock(x: number, y: number, z: number, get: Function): number;
    getHeightMap(x: number, y: number, z: number): number;
}
export declare class DesertBiome extends BaseBiome {
    id: string;
    height: number;
    mountainNoise: Noise2D;
    constructor(blocks: any, feature: any, seed: any);
    getBlock(x: number, y: number, z: number, get: Function): number;
    getHeightMap(x: number, y: number, z: number): number;
}
export declare class MountainsBiome extends BaseBiome {
    id: string;
    height: number;
    hightVariationNoise: Noise2D;
    constructor(blocks: any, feature: any, seed: any);
    getBlock(x: number, y: number, z: number, get: Function): number;
    getHeightMap(x: number, y: number, z: number): number;
}
export declare class IceMountainsBiome extends MountainsBiome {
    id: string;
    getBlock(x: number, y: number, z: number, get: Function): number;
}
export declare class OceanBiome extends BaseBiome {
    id: string;
    height: number;
    getBlock(x: number, y: number, z: number, get: Function): number;
    getHeightMap(x: number, y: number, z: number): number;
}
export declare class BeachBiome extends BaseBiome {
    id: string;
    height: number;
    getBlock(x: number, y: number, z: number, get: Function): number;
    getHeightMap(x: number, y: number, z: number): number;
}
//# sourceMappingURL=biomes.d.ts.map