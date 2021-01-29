import type { Server } from "../../server";
import { ItemStack } from "../registry";
import { Inventory, InventoryObject } from "./generalInventory";
export declare class ArmorInventory extends Inventory {
    constructor(data: InventoryObject | null, server: Server);
    getHelmet(): ItemStack;
    getChestplate(): ItemStack;
    getLeggings(): ItemStack;
    getBoots(): ItemStack;
}
//# sourceMappingURL=armorInventory.d.ts.map