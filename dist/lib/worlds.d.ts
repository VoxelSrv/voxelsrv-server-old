import * as types from '../types';
import type { Server } from '../server';
import { Block } from './registry';
import type { ICoreWorldManager, ICoreWorldGenerator, ICoreWorld } from 'voxelservercore/interfaces/world';
export declare class WorldManager implements ICoreWorldManager {
    readonly chunkWitdh = 32;
    readonly chunkHeight = 256;
    readonly lastChunk = 5000;
    worlds: {
        [index: string]: World;
    };
    worldGenerator: {
        [index: string]: IWorldGenerator;
    };
    readonly _baseMetadata: {
        ver: number;
        stage: number;
    };
    _server: Server;
    constructor(server: any);
    create(name: string, seed: number, generator: string): World | null;
    load(name: string): World | null;
    unload(name: string): void;
    exist(name: string): boolean;
    get(name: string): World | undefined;
    addGenerator(name: string, gen: any): void;
}
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
    getBlock(data: types.XYZ, allowgen: boolean): Block;
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
export declare function globalToChunk(pos: types.XYZ): {
    id: types.XZ;
    pos: types.XYZ;
};
export declare function chunkIDFromGlobal(pos: types.XYZ): types.XZ;
export declare function globalToLocal(pos: types.XYZ): types.XYZ;
export declare function getRandomSeed(): number;
export declare function validateID(id: number[]): boolean;
export interface IWorldGenerator extends ICoreWorldGenerator {
    new (seed: number, server: Server): IWorldGenerator;
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
//# sourceMappingURL=worlds.d.ts.map