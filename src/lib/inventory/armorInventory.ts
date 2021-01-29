import type { Server } from "../../server";
import { ItemStack } from "../registry";
import { Inventory, InventoryObject } from "./generalInventory";

export class ArmorInventory extends Inventory {
	constructor(data: InventoryObject | null, server: Server) {
		super(0.55, data, server);
	}

	getHelmet(): ItemStack {
		return this.items[0];
	}

	getChestplate(): ItemStack {
		return this.items[1];
	}

	getLeggings(): ItemStack {
		return this.items[2];
	}

	getBoots(): ItemStack {
		return this.items[3];
	}
}