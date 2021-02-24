import * as types from '../../types';
import * as biome from './parts/biomes';
import type { World, IWorldGenerator } from '../../lib/world/world';
import type { Server } from '../../server';
export default class FlatGenerator implements IWorldGenerator {
    name: string;
    chunkWitdh: number;
    chunkHeight: number;
    seed: number;
    blocks: any;
    biome: biome.BaseBiome;
    _server: Server;
    _lastWorkerUsed: number;
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
    generateBaseChunk(id: types.XZ, chunkignore: types.IView3duint16): Promise<types.IView3duint16>;
    generateChunk(id: types.XZ, chunk: types.IView3duint16, world: World): Promise<void>;
}
//# sourceMappingURL=flat.d.ts.map