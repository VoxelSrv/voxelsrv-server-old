import type { World, Chunk } from './world';
import type { EntityManager } from './manager';
import * as types from '../../types';
import { ArmorInventory } from '../inventory/armorInventory';
import { Item } from '../registry';
export interface EntityData {
    position: types.XYZ;
    rotation: number;
    pitch: number;
    health: number;
    maxHealth: number;
    model: string;
    texture: string;
    name: string;
    nametag: boolean;
    hitbox: types.XYZ;
    armor?: ArmorInventory | any;
    helditem?: Item;
    [index: string]: any;
}
export interface IEntity {
    data: EntityData;
    readonly id: string;
    world: World;
    chunkID: types.XZ;
    chunk: Chunk;
    tick: Function | null;
    readonly type: string;
}
export interface IEntityObject {
    data: EntityData;
    readonly id: string;
    world: string;
    chunk: types.XZ;
    readonly type: string;
}
export declare class Entity implements IEntity {
    data: EntityData;
    readonly id: string;
    world: World;
    chunkID: types.XZ;
    chunk: Chunk;
    tick: Function | null;
    readonly type: string;
    _entities: EntityManager;
    constructor(id: string, type: string, data: EntityData, world: World, tick: Function | null, entitymanager: EntityManager);
    getObject(): IEntityObject;
    teleport(pos: types.XYZ, eworld: World | string): void;
    move(pos: types.XYZ): void;
    rotate(rot: number, pitch: number): void;
    remove(): void;
    getID(): string;
}
//# sourceMappingURL=entity.d.ts.map