"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const registry_1 = require("../registry");
const events_1 = require("events");
// Generic Inventory for mobs/block like chest, etc
class Inventory {
    constructor(size, data, server) {
        this.selected = 0;
        this._server = server;
        this.items = {};
        this.size = Math.round(size * 9 - 1);
        if (data != undefined && data != null) {
            for (const prop in data.items) {
                if (data.items[prop] != null && data.items[prop] != {})
                    this.items[prop] = new registry_1.ItemStack(data.items[prop].id, data.items[prop].count, data.items[prop].data, this._server.registry);
            }
        }
        for (let x = 0; x < size * 9; x++) {
            if (this.items[x] == undefined || this.items[x] == {})
                this.items[x] = null;
        }
        this.lastUpdate = Date.now();
        this.event = new events_1.EventEmitter();
    }
    add(item, count, metadata = {}) {
        if (this._server.registry.items[item] == undefined)
            return false;
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
                this.items[slot] = new registry_1.ItemStack(item, count, data, this._server.registry);
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
    remove(item, count) {
        if (this._server.registry.items[item] == undefined)
            return false;
        this.lastUpdate = Date.now();
        let allItems = Object.entries(this.items);
        let sel = this.selected;
        if (this.items[sel] != null && this.items[sel].id == item) {
            let newcount = this.items[sel].count - count;
            count = count - this.items[sel].count;
            if (newcount > 0)
                this.items[sel].count = newcount;
            else
                this.items[sel] = null;
            this.event.emit('slot-update', {
                data: this.items[sel],
                slot: sel,
                type: 'main',
            });
            if (count <= 0)
                return true;
        }
        for (let [slot, data] of allItems) {
            if (count <= 0)
                return true;
            if (data != null && data.id == item) {
                let newcount = data.count - count;
                count = count - data.count;
                if (newcount > 0)
                    this.items[slot] = new registry_1.ItemStack(item, newcount, data.data, this._server.registry);
                else
                    this.items[slot] = null;
                this.event.emit('slot-update', {
                    data: this.items[slot],
                    slot: slot,
                    type: 'main',
                });
            }
        }
        return true;
    }
    set(slot, item, count, data) {
        this.lastUpdate = Date.now();
        if (this._server.registry.items[item] == undefined || item == null || count == null || data == null)
            this.items[slot] = null;
        else
            this.items[slot] = new registry_1.ItemStack(item, count, data, this._server.registry);
        this.event.emit('slot-update', {
            data: this.items[slot],
            slot: slot,
            type: 'main',
        });
    }
    contains(item, count) {
        let items = Object.entries(this.items);
        for (let x = 0; x < items.length; x++) {
            let item2 = this.items[x];
            if (item2.id == item && item2.count >= count)
                return x;
        }
        return -1;
    }
    getObject() {
        return { items: this.items, size: this.size, selected: this.selected };
    }
}
exports.Inventory = Inventory;
//# sourceMappingURL=generalInventory.js.map