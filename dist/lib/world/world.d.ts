import * as types from '../../types';
import type { Server } from '../../server';
import { Block } from '../registry';
import type { ICoreWorldGenerator, ICoreWorld } from 'voxelservercore/interfaces/world';
import { WorldManager } from './manager';
export declare class World implements ICoreWorld {
    name: string;
    seed: number;
    generator: any;
    version: number;
    chunks: {
        [index: string]: Chunk;
    };
    entities: object;
    folder: string;
    chunkFolder: string;
    autoSaveInterval: any;
    chunkUnloadInterval: any;
    active: boolean;
    _server: Server;
    _worldMen: WorldManager;
    constructor(name: string, seed: number, generator: string, ver: number, server: Server);
    stringToID(id: string): types.XZ;
    getChunk(id: types.XZ): Promise<Chunk>;
    getNeighborIDsChunks(id: types.XZ): types.XZ[];
    existChunk(id: types.XZ): boolean;
    saveAll(): void;
    saveChunk(id: types.XZ): Promise<void>;
    readChunk(id: types.XZ): Promise<{
        chunk: types.IView3duint16;
        metadata: any;
    }>;
    readChunkSync(id: types.XZ): {
        chunk: types.IView3duint16;
        metadata: any;
    };
    unloadChunk(id: types.XZ): void;
    getSettings(): {
        name: string;
        seed: number;
        generator: any;
        version: number;
    };
    getBlock(data: types.XYZ, allowgen: boolean): Promise<Block>;
    getBlockSync(data: types.XYZ, allowgen?: boolean): Block;
    setBlock(data: types.XYZ, block: string | number | Block, allowgen?: boolean): Promise<void>;
    setRawBlock(data: types.XYZ, block: number): Promise<void>;
    unload(): void;
}
export declare class Chunk {
    id: types.XZ;
    data: types.IView3duint16;
    metadata: any;
    lastUse: number;
    forceload: boolean;
    constructor(id: types.XZ, blockdata: types.IView3duint16, metadata: object, bool: boolean);
    set(x: number, y: number, z: number, id: number): void;
    get(x: number, y: number, z: number): number;
    keepAlive(): void;
}
export interface IWorldGenerator extends ICoreWorldGenerator {
    getBlock(x: number, y: number, z: number, biomes: any): number;
    getBiome(x: number, z: number): any;
    getBiomesAt(x: number, z: number): {
        main: any;
        possible: {
            [index: string]: number;
        };
        height: number;
        size: number;
    };
    generateBaseChunk(id: types.XZ, chunk: types.IView3duint16): Promise<types.IView3duint16>;
    generateChunk(id: types.XZ, chunk: types.IView3duint16, world: World): Promise<void>;
}
//# sourceMappingURL=world.d.ts.map