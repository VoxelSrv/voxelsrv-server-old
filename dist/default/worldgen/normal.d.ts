import { Noise2D, Noise3D } from 'open-simplex-noise';
import hash from 'murmur-numbers';
import * as types from '../../types';
import * as biome from './parts/biomes';
import { World } from '../../lib/worlds';
import type { Server } from '../../server';
export default class NormalGenerator {
    name: string;
    chunkWitdh: number;
    chunkHeight: number;
    waterLevel: number;
    seed: number;
    biomeNoise1: Noise2D;
    biomeNoise2: Noise2D;
    biomeNoise3: Noise2D;
    caveNoise1: Noise3D;
    caveNoise2: Noise3D;
    plantSeed: number;
    biomeSpacing: number;
    blocks: any;
    biomes: any;
    hash: hash;
    features: {
        oakTree: number;
        birchTree: number;
        cactus: number;
    };
    _server: Server;
    constructor(seed: number, server: Server);
    getBlock(x: number, y: number, z: number, biomes: any): number;
    getBiome(x: number, z: number): biome.BaseBiome;
    getBiomesAt(x: number, z: number): {
        main: biome.BaseBiome;
        possible: {
            [index: string]: number;
        };
        height: number;
        size: number;
    };
    generateBaseChunk(id: types.XZ, chunk: types.IView3duint16): Promise<types.IView3duint16>;
    generateChunk(id: types.XZ, chunk: types.IView3duint16, world: World): Promise<void>;
}
//# sourceMappingURL=normal.d.ts.map