import { IItemStack, ItemStack, itemRegistry } from './registry';
import { EventEmitter } from 'events';

// Generic Inventory for mobs/block like chest, etc

interface InventoryObject {
	main: any;
	maxslot: number;
	tempslot?: IItemStack;
	selected?: number;
}

export type InventoryTypes = PlayerInventory | Inventory;

export class Inventory {
	main: object;
	maxslot: number;
	lastUpdate: number;
	event: EventEmitter;
	selected: number = 0;

	constructor(size: number, data: InventoryObject | null) {
		this.main = {};
		this.maxslot = size * 9 - 1;
		if (data != undefined && data != null) {
			for (const prop in data.main) {
				if (data.main[prop] != null && data.main[prop] != {})
					this.main[prop] = new ItemStack(data.main[prop].id, data.main[prop].count, data.main[prop].data);
			}
		}

		for (let x = 0; x < size * 9; x++) {
			if (this.main[x] == undefined || this.main[x] == {}) this.main[x] = null;
		}
		this.lastUpdate = Date.now();
		this.event = new EventEmitter();
	}

	add(item: string, count: number): boolean {
		if (itemRegistry[item] == undefined) return false;

		this.lastUpdate = Date.now();
		let invItems = Object.entries(this.main);
		for (let [slot, data] of invItems) {
			if (data != null && data.id == item && data.count + count < itemRegistry[item].stack + 1) {
				this.main[slot].count = count + data.count;
				this.event.emit('slot-update', {
					data: this.main[slot],
					slot: slot,
					type: 'main',
				});
				return true;
			}
		}
		for (let [slot, data] of invItems) {
			if (data == null) {
				this.main[slot] = new ItemStack(item, count, data);
				this.event.emit('slot-update', {
					data: this.main[slot],
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
		let allItems = Object.entries(this.main);
		let sel = this.selected;
		if (this.main[sel] != null && this.main[sel].id == item) {
			let newcount = this.main[sel].count - count;
			count = count - this.main[sel].count;
			if (newcount > 0) this.main[sel].count = newcount;
			else this.main[sel] = null;
			this.event.emit('slot-update', {
				data: this.main[sel],
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
				if (newcount > 0) this.main[slot] = new ItemStack(item, newcount, data.data);
				else this.main[slot] = null;
				this.event.emit('slot-update', {
					data: this.main[slot],
					slot: slot,
					type: 'main',
				});
			}
		}
		return true;
	}

	set(slot: number, item: string | null, count: number | null, data: object | null): void {
		this.lastUpdate = Date.now();

		if (itemRegistry[item] == undefined || item == null || count == null || data == null) this.main[slot] = null;
		else this.main[slot] = new ItemStack(item, count, data);

		this.event.emit('slot-update', {
			data: this.main[slot],
			slot: slot,
			type: 'main',
		});
	}

	contains(item: string, count: number): number {
		let items = Object.entries(this.main);

		for (let x = 0; x < items.length; x++) {
			let item2: ItemStack = this.main[x];
			if (item2.id == item && item2.count >= count) return x;
		}

		return -1;
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

	getObject(): InventoryObject {
		return {
			main: this.main,
			selected: this.selected,
			tempslot: this.tempslot,
			maxslot: this.maxslot,
		};
	}

	getTool(): object {
		let sel = this.selected;
		return this.main[sel];
	}

	action_switch(x: number, y: number): void {
		this.lastUpdate = Date.now();
		this.updated = false;
		let tempx = this.main[x];
		let tempy = this.main[y];
		this.main[x] = tempy;
		this.main[y] = tempx;
		this.event.emit('slot-update', {
			data: this.main[x],
			slot: x,
			type: 'main',
		});
		this.event.emit('slot-update', {
			data: this.main[y],
			slot: y,
			type: 'main',
		});
	}

	action_left(inv: InventoryTypes, x: number): void {
		this.lastUpdate = Date.now();
		this.updated = false;
		if (x >= 0) {
			// Normal slots
			let tempY = { ...this.tempslot };
			let tempX = { ...inv.main[x] };

			// If tempslot and target slot have the same itemtype
			if (tempY.id == tempX.id && tempY.id != undefined) {
				if (tempX.count + tempY.count <= itemRegistry[tempX.id].stack) {
					let tempZ = { ...tempX };
					tempZ.count = tempX.count + tempY.count;
					inv.main[x] = tempZ;
					this.tempslot = null;
				} else if (tempX.count + tempY.count > itemRegistry[tempX.id].stack) {
					let tempZ = { ...tempX };
					let tempW = { ...tempY };
					tempZ.count = itemRegistry[tempX.id].stack;
					tempW.count = tempX.count + tempY.count - itemRegistry[tempX.id].stack;
					inv.main[x] = tempZ;
					this.tempslot = tempW;
				}
				inv.event.emit('slot-update', {
					data: inv.main[x],
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
				inv.main[x] = tempY;
				this.tempslot = tempX;
				inv.event.emit('slot-update', {
					data: inv.main[x],
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

	action_right(inv: InventoryTypes, x: number): void {
		this.lastUpdate = Date.now();
		this.updated = false;
		// Normal slots
		if (x >= 0) {
			let tempY = { ...this.tempslot };
			let tempX = { ...inv.main[x] };
			if (tempY.id == undefined) {
				// Tempslot slot is empty
				let tempZ = { ...tempX };
				let tempW = { ...tempX };
				tempZ.count = Math.ceil(tempZ.count / 2);
				tempW.count = Math.floor(tempW.count / 2);
				if (tempW.count <= 0) tempW = {};
				inv.main[x] = { ...tempZ };
				this.tempslot = { ...tempW };
			} else if (tempX.id == undefined) {
				// Target is empty
				let tempZ = { ...tempY };
				let tempW = { ...tempY };
				tempZ.count = 1;
				tempW.count = tempW.count - 1;
				if (tempW.count <= 0) tempW = null;
				inv.main[x] = { ...tempZ };
				this.tempslot = { ...tempW };
			} else if (tempX.id == tempY.id && tempX.count + 1 <= itemRegistry[tempX.id].stack) {
				// The same itemtype
				let tempZ = { ...tempX };
				let tempW = { ...tempY };
				tempZ.count = tempZ.count + 1;
				tempW.count = tempW.count - 1;
				if (tempW.count <= 0) tempW = null;
				inv.main[x] = { ...tempZ };
				this.tempslot = { ...tempW };
			}
			inv.event.emit('slot-update', {
				data: inv.main[x],
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
