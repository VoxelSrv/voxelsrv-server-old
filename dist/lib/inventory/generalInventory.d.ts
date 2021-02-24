/// <reference types="node" />
import { IItemStack } from '../registry';
import { EventEmitter } from 'events';
import type { Server } from '../../server';
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
    add(item: string, count: number, metadata?: object): boolean;
    remove(item: string, count: number): boolean;
    set(slot: number, item: string | null, count: number | null, data: object | null): void;
    contains(item: string, count: number): number;
    getObject(): InventoryObject;
}
export interface InventoryObject {
    items: {
        [index: number]: any;
    };
    size: number;
    tempslot?: IItemStack;
    selected?: number;
    [i: string]: any;
}
//# sourceMappingURL=generalInventory.d.ts.map