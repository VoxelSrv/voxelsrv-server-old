import { IItemStack, ItemStack } from '../registry';
import { EventEmitter } from 'events';
import type { Server } from '../../server';

// Generic Inventory for mobs/block like chest, etc

export class Inventory {
	items: {[index: number]: any};
	readonly size: number;
	lastUpdate: number;
	readonly event: EventEmitter;
	selected: number = 0;
	_server: Server;

	constructor(size: number, data: InventoryObject | null, server: Server) {
		this._server = server;
		this.items = {};
		this.size = Math.round(size * 9 - 1);
		if (data != undefined && data != null) {
			for (const prop in data.items) {
				if (data.items[prop] != null && data.items[prop] != {})
					this.items[prop] = new ItemStack(data.items[prop].id, data.items[prop].count, data.items[prop].data, this._server.registry);
			}
		}

		for (let x = 0; x < size * 9; x++) {
			if (this.items[x] == undefined || this.items[x] == {}) this.items[x] = null;
		}
		this.lastUpdate = Date.now();
		this.event = new EventEmitter();
	}

	add(item: string, count: number, metadata: object = {}): boolean {
		if (this._server.registry.items[item] == undefined) return false;

		this.lastUpdate = Date.now();
		let invItems = Object.entries(this.items);
		for (let [slot, data] of invItems) {
			if (data != null && data.id == item && data.count + count < this._server.registry.items[item].stack + 1) {
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
				this.items[slot] = new ItemStack(item, count, data, this._server.registry);
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
		if (this._server.registry.items[item] == undefined) return false;

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
				if (newcount > 0) this.items[slot] = new ItemStack(item, newcount, data.data, this._server.registry);
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

		if (this._server.registry.items[item] == undefined || item == null || count == null || data == null) this.items[slot] = null;
		else this.items[slot] = new ItemStack(item, count, data, this._server.registry);

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
		return { items: this.items, size: this.size, selected: this.selected };
	}
}



export interface InventoryObject {
	items: {[index: number]: any};
	size: number;
	tempslot?: IItemStack;
	selected?: number;
	[i: string]: any
}