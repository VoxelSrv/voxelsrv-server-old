import type { Server } from '../server';
import type { ICoreRegistry, ICoreBasicBlock, ICoreBasicItem, ICoreCommand } from 'voxelservercore/interfaces/registry';
export declare class Registry implements ICoreRegistry {
    items: {
        [index: string]: any;
    };
    blocks: {
        [index: string]: any;
    };
    commands: {
        [index: string]: any;
    };
    blockPalette: {
        [index: string]: number;
    };
    blockIDmap: {
        [index: number]: string;
    };
    _blockRegistryObject: {
        [index: string]: object;
    };
    _itemRegistryObject: {
        [index: string]: object;
    };
    _freeIDs: number[];
    _lastID: number;
    finalized: boolean;
    _server: Server;
    constructor(server: Server);
    _loadPalette(): void;
    addItem(item: Item): void;
    addBlock(block: Block): void;
    addCommand(command: Command): void;
    _finalize(force?: boolean): void;
}
export interface IItemStack {
    id: string;
    count: number;
    stack: number;
    item: ICoreBasicItem;
    [propName: string]: any;
}
export declare class ItemStack {
    id: string;
    count: number;
    data: object;
    constructor(id: string, count: number, data: object, registry: Registry);
    getObject(): object;
}
export declare class Item implements ICoreBasicItem {
    id: string;
    numId: number;
    name: string;
    texture: string | Array<string>;
    stack: number;
    registry: Registry;
    constructor(id: string, name: string, texture: string | string[], stack: number);
    getItemStack(count?: number): ItemStack;
    getObject(): object;
    _finalize(registry: any): void;
}
export declare class ItemBlock extends Item {
    block: any;
    blockID: string;
    flat: boolean;
    constructor(id: string, name: string, texture: string | string[], stack: number, block: string, flat: boolean);
    getObject(): object;
    _finalize(registry: any): void;
}
export declare class ItemTool extends Item {
    type: string;
    durability: number;
    power: number;
    speed: number;
    constructor(id: string, name: string, texture: string, type: string, durability: number, power: number, speed: number);
    getObject(): object;
    canMine(b: Block | string): boolean;
}
export declare class ItemArmor extends Item {
    type: string;
    durability: number;
    reduction: number;
    constructor(id: string, name: string, texture: string, type: string, durability: number, reduction: number);
    getReducedDamage(x: number): number;
    getObject(): object;
}
export declare class Block implements ICoreBasicBlock {
    numId: number;
    id: string;
    name: string;
    type: number;
    texture: string | Array<string>;
    options: object;
    hardness: number;
    unbreakable: boolean;
    miningtime: number;
    tool: string | string[];
    registry: Registry;
    constructor(id: string, type: number, texture: string | string[], options: object, hardness: number, miningtime: number, tool: string | string[]);
    getItemStack(count?: number): ItemStack;
    getObject(): object;
    _finalize(registry: Registry): void;
}
export declare class Command implements ICoreCommand {
    command: string;
    description: string;
    trigger: any;
    constructor(command: string, func: Function, description?: string);
}
//# sourceMappingURL=registry.d.ts.map