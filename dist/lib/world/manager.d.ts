import * as types from '../../types';
import type { Server } from '../../server';
import { World } from './world';
import type { ICoreWorldManager, ICoreWorldGenerator } from 'voxelservercore/interfaces/world';
import { Entity, EntityData } from './entity';
export declare class WorldManager implements ICoreWorldManager {
    readonly chunkWitdh = 32;
    readonly chunkHeight = 256;
    readonly lastChunk = 5000;
    worlds: {
        [index: string]: World;
    };
    worldGenerator: {
        [index: string]: IWorldGeneratorConstructor;
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
interface IWorldGeneratorConstructor {
    new (seed: number, server: Server): IWorldGenerator;
}
export declare class EntityManager {
    _worlds: WorldManager;
    _server: Server;
    constructor(server: Server);
    create(type: string, data: EntityData, worldName: string, tick: Function | null): Entity;
    recreate(id: string, type: string, data: EntityData, worldName: string, tick: Function | null): Entity;
    get(world: any, id: any): any;
    getAll(world: any): object;
}
export {};
//# sourceMappingURL=manager.d.ts.map