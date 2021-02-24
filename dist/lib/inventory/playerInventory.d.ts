import type { Server } from "../../server";
import { IItemStack } from "../registry";
import { Inventory, InventoryObject } from "./generalInventory";
export declare class PlayerInventory extends Inventory {
    selected: number;
    tempslot: IItemStack | null;
    updated: boolean;
    constructor(size: number, data: InventoryObject, server: Server);
    select(slot: number): void;
    getTool(): object;
    action_switch(x: number, y: number): void;
    action_left(inv: InventoryObject, x: number, type: string): void;
    action_right(inv: InventoryObject, x: number, type: string): void;
    getObject(): InventoryObject;
}
//# sourceMappingURL=playerInventory.d.ts.map