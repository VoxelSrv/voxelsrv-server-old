/// <reference types="node" />
import { IItemStack, ItemStack } from './registry';
import { EventEmitter } from 'events';
import type { Server } from '../server';
export interface InventoryObject {
    items: {
        [index: number]: any;
    };
    size: number;
    tempslot?: IItemStack;
    selected?: number;
}
export declare type InventoryTypes = PlayerInventory | Inventory | ArmorInventory;
export declare class Inventory {
    items: {
        [index: number]: any;
    };
    readonly size: number;
    lastUpdate: number;
    readonly event: EventEmitter;
    selected: number;
    _server: Server;
    constructor(size: number, data: InventoryObject | null, server: Server);
    add(item: string, count: number): boolean;
    remove(item: string, count: number): boolean;
    set(slot: number, item: string | null, count: number | null, data: object | null): void;
    contains(item: string, count: number): number;
    getObject(): InventoryObject;
}
export declare class PlayerInventory extends Inventory {
    selected: number;
    tempslot: IItemStack | null;
    updated: boolean;
    constructor(size: number, data: InventoryObject, server: Server);
    select(slot: number): void;
    getTool(): object;
    action_switch(x: number, y: number): void;
    action_left(inv: InventoryTypes, x: number, type: string): void;
    action_right(inv: InventoryTypes, x: number, type: string): void;
    getObject(): InventoryObject;
}
export declare class ArmorInventory extends Inventory {
    constructor(data: InventoryObject | null, server: Server);
    getHelmet(): ItemStack;
    getChestplate(): ItemStack;
    getLeggings(): ItemStack;
    getBoots(): ItemStack;
}
//# sourceMappingURL=inventory.d.ts.map