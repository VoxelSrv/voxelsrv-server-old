import { IItemStack, ItemStack, itemRegistry } from './registry';
import { EventEmitter } from 'events';

// Generic Inventory for mobs/block like chest, etc

interface InventoryObject {
	items: any;
	size: number;
	tempslot?: IItemStack;
	selected?: number;
}

export type InventoryTypes = PlayerInventory | Inventory | ArmorInventory;

export class Inventory {
	items: object;
	size: number;
	lastUpdate: number;
	event: EventEmitter;
	selected: number = 0;

	constructor(size: number, data: InventoryObject | null) {
		this.items = {};
		this.size = Math.round(size * 9 - 1);
		if (data != undefined && data != null) {
			for (const prop in data.items) {
				if (data.items[prop] != null && data.items[prop] != {})
					this.items[prop] = new ItemStack(data.items[prop].id, data.items[prop].count, data.items[prop].data);
			}
		}

		for (let x = 0; x < size * 9; x++) {
			if (this.items[x] == undefined || this.items[x] == {}) this.items[x] = null;
		}
		this.lastUpdate = Date.now();
		this.event = new EventEmitter();
	}

	add(item: string, count: number): boolean {
		if (itemRegistry[item] == undefined) return false;

		this.lastUpdate = Date.now();
		let invItems = Object.entries(this.items);
		for (let [slot, data] of invItems) {
			if (data != null && data.id == item && data.count + count < itemRegistry[item].stack + 1) {
				this.items[slot].count = count + data.count;
				this.event.emit('slot-update', {
					data: this.items[slot],
					slot: slot,
					type: 'main',
				});
				return true;
			}
		}
		for (let [slot, data] of invItems) {
			if (data == null) {
				this.items[slot] = new ItemStack(item, count, data);
				this.event.emit('slot-update', {
					data: this.items[slot],
					slot: slot,
					type: 'main',
				});
				return true;
			}
		}
		return false;
	}

	remove(item: string, count: number): boolean {
		if (itemRegistry[item] == undefined) return false;

		this.lastUpdate = Date.now();
		let allItems = Object.entries(this.items);
		let sel = this.selected;
		if (this.items[sel] != null && this.items[sel].id == item) {
			let newcount = this.items[sel].count - count;
			count = count - this.items[sel].count;
			if (newcount > 0) this.items[sel].count = newcount;
			else this.items[sel] = null;
			this.event.emit('slot-update', {
				data: this.items[sel],
				slot: sel,
				type: 'main',
			});
			if (count <= 0) return true;
		}
		for (let [slot, data] of allItems) {
			if (count <= 0) return true;
			if (data != null && data.id == item) {
				let newcount = data.count - count;
				count = count - data.count;
				if (newcount > 0) this.items[slot] = new ItemStack(item, newcount, data.data);
				else this.items[slot] = null;
				this.event.emit('slot-update', {
					data: this.items[slot],
					slot: slot,
					type: 'main',
				});
			}
		}
		return true;
	}

	set(slot: number, item: string | null, count: number | null, data: object | null): void {
		this.lastUpdate = Date.now();

		if (itemRegistry[item] == undefined || item == null || count == null || data == null) this.items[slot] = null;
		else this.items[slot] = new ItemStack(item, count, data);

		this.event.emit('slot-update', {
			data: this.items[slot],
			slot: slot,
			type: 'main',
		});
	}

	contains(item: string, count: number): number {
		let items = Object.entries(this.items);

		for (let x = 0; x < items.length; x++) {
			let item2: ItemStack = this.items[x];
			if (item2.id == item && item2.count >= count) return x;
		}

		return -1;
	}

	getObject(): InventoryObject {
		return {...this};
	}

}

// Inventory for players

export class PlayerInventory extends Inventory {
	selected: number;
	tempslot: IItemStack | null;
	updated: boolean;

	constructor(size: number, data: InventoryObject) {
		super(size, data);
		if (data == undefined) {
			this.selected = 0;
			this.tempslot = null;
		} else {
			this.selected = data.selected;
			this.tempslot = data.tempslot;
		}
		this.updated = false;
	}

	select(slot: number): void {
		this.selected = slot;
	}

	getTool(): object {
		let sel = this.selected;
		return this.items[sel];
	}

	action_switch(x: number, y: number): void {
		this.lastUpdate = Date.now();
		this.updated = false;
		let tempx = this.items[x];
		let tempy = this.items[y];
		this.items[x] = tempy;
		this.items[y] = tempx;
		this.event.emit('slot-update', {
			data: this.items[x],
			slot: x,
			type: 'main',
		});
		this.event.emit('slot-update', {
			data: this.items[y],
			slot: y,
			type: 'main',
		});
	}

	action_left(inv: InventoryTypes, x: number, type: string): void {
		this.lastUpdate = Date.now();
		this.updated = false;
		if (x >= 0) {
			// Normal slots
			let tempY = { ...this.tempslot };
			let tempX = { ...inv.items[x] };

			// If tempslot and target slot have the same itemtype
			if (tempY.id == tempX.id && tempY.id != undefined) {
				if (tempX.count + tempY.count <= itemRegistry[tempX.id].stack) {
					let tempZ = { ...tempX };
					tempZ.count = tempX.count + tempY.count;
					inv.items[x] = tempZ;
					this.tempslot = null;
				} else if (tempX.count + tempY.count > itemRegistry[tempX.id].stack) {
					let tempZ = { ...tempX };
					let tempW = { ...tempY };
					tempZ.count = itemRegistry[tempX.id].stack;
					tempW.count = tempX.count + tempY.count - itemRegistry[tempX.id].stack;
					inv.items[x] = tempZ;
					this.tempslot = tempW;
				}
				this.event.emit('slot-update', {
					data: inv.items[x],
					slot: x,
					type: type,
				});
				inv.event.emit('slot-update', {
					data: inv.items[x],
					slot: x,
					type: 'main',
				});
				this.event.emit('slot-update', {
					data: this.tempslot,
					slot: -1,
					type: 'temp',
				});
			}
			// If target slot has diffrent itemtype
			else {
				inv.items[x] = tempY;
				this.tempslot = tempX;
				
				this.event.emit('slot-update', {
					data: inv.items[x],
					slot: x,
					type: type,
				});
				inv.event.emit('slot-update', {
					data: inv.items[x],
					slot: x,
					type: 'main',
				});
				this.event.emit('slot-update', {
					data: this.tempslot,
					slot: -1,
					type: 'temp',
				});
			}
		}
	}

	action_right(inv: InventoryTypes, x: number, type: string): void {
		this.lastUpdate = Date.now();
		this.updated = false;
		// Normal slots
		if (x >= 0) {
			let tempY = { ...this.tempslot };
			let tempX = { ...inv.items[x] };
			if (tempY.id == undefined) {
				// Tempslot slot is empty
				let tempZ = { ...tempX };
				let tempW = { ...tempX };
				tempZ.count = Math.ceil(tempZ.count / 2);
				tempW.count = Math.floor(tempW.count / 2);
				if (tempW.count <= 0) tempW = {};
				inv.items[x] = { ...tempZ };
				this.tempslot = { ...tempW };
			} else if (tempX.id == undefined) {
				// Target is empty
				let tempZ = { ...tempY };
				let tempW = { ...tempY };
				tempZ.count = 1;
				tempW.count = tempW.count - 1;
				if (tempW.count <= 0) tempW = null;
				inv.items[x] = { ...tempZ };
				this.tempslot = { ...tempW };
			} else if (tempX.id == tempY.id && tempX.count + 1 <= itemRegistry[tempX.id].stack) {
				// The same itemtype
				let tempZ = { ...tempX };
				let tempW = { ...tempY };
				tempZ.count = tempZ.count + 1;
				tempW.count = tempW.count - 1;
				if (tempW.count <= 0) tempW = null;
				inv.items[x] = { ...tempZ };
				this.tempslot = { ...tempW };
			}

			this.event.emit('slot-update', {
				data: inv.items[x],
				slot: x,
				type: type,
			});
			inv.event.emit('slot-update', {
				data: inv.items[x],
				slot: x,
				type: 'main',
			});
			this.event.emit('slot-update', {
				data: this.tempslot,
				slot: -1,
				type: 'temp',
			});
		}
	}
}

export class ArmorInventory extends Inventory {
	constructor(data: InventoryObject | null) {
		super( 0.55 , data);
		
	}

	getHelmet(): ItemStack {
		return this.items[0]
	}

	getChestplate(): ItemStack {
		return this.items[1]
	}

	getLeggings(): ItemStack {
		return this.items[2]
	}

	getBoots(): ItemStack {
		return this.items[3]
	}
}