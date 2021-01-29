"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerInventory = void 0;
const generalInventory_1 = require("./generalInventory");
class PlayerInventory extends generalInventory_1.Inventory {
    constructor(size, data, server) {
        super(size, data, server);
        if (data == undefined) {
            this.selected = 0;
            this.tempslot = null;
        }
        else {
            this.selected = data.selected;
            this.tempslot = data.tempslot;
        }
        this.updated = false;
    }
    select(slot) {
        this.selected = slot;
    }
    getTool() {
        let sel = this.selected;
        return this.items[sel];
    }
    action_switch(x, y) {
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
    action_left(inv, x, type) {
        this.lastUpdate = Date.now();
        this.updated = false;
        if (x >= 0) {
            // Normal slots
            let tempY = { ...this.tempslot };
            let tempX = { ...inv.items[x] };
            // If tempslot and target slot have the same itemtype
            if (tempY.id == tempX.id && tempY.id != undefined) {
                if (tempX.count + tempY.count <= this._server.registry.items[tempX.id].stack) {
                    let tempZ = { ...tempX };
                    tempZ.count = tempX.count + tempY.count;
                    inv.items[x] = tempZ;
                    this.tempslot = null;
                }
                else if (tempX.count + tempY.count > this._server.registry.items[tempX.id].stack) {
                    let tempZ = { ...tempX };
                    let tempW = { ...tempY };
                    tempZ.count = this._server.registry.items[tempX.id].stack;
                    tempW.count = tempX.count + tempY.count - this._server.registry.items[tempX.id].stack;
                    inv.items[x] = tempZ;
                    this.tempslot = tempW;
                }
                this.event.emit('slot-update', {
                    data: inv.items[x],
                    slot: x,
                    type: type,
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
                this.event.emit('slot-update', {
                    data: this.tempslot,
                    slot: -1,
                    type: 'temp',
                });
            }
        }
    }
    action_right(inv, x, type) {
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
                if (tempW.count <= 0)
                    tempW = {};
                inv.items[x] = { ...tempZ };
                this.tempslot = { ...tempW };
            }
            else if (tempX.id == undefined) {
                // Target is empty
                let tempZ = { ...tempY };
                let tempW = { ...tempY };
                tempZ.count = 1;
                tempW.count = tempW.count - 1;
                if (tempW.count <= 0)
                    tempW = null;
                inv.items[x] = { ...tempZ };
                this.tempslot = { ...tempW };
            }
            else if (tempX.id == tempY.id && tempX.count + 1 <= this._server.registry.items[tempX.id].stack) {
                // The same itemtype
                let tempZ = { ...tempX };
                let tempW = { ...tempY };
                tempZ.count = tempZ.count + 1;
                tempW.count = tempW.count - 1;
                if (tempW.count <= 0)
                    tempW = null;
                inv.items[x] = { ...tempZ };
                this.tempslot = { ...tempW };
            }
            this.event.emit('slot-update', {
                data: inv.items[x],
                slot: x,
                type: type,
            });
            this.event.emit('slot-update', {
                data: this.tempslot,
                slot: -1,
                type: 'temp',
            });
        }
    }
    getObject() {
        return { items: this.items, size: this.size, selected: this.selected, tempslot: this.tempslot };
    }
}
exports.PlayerInventory = PlayerInventory;
//# sourceMappingURL=playerInventory.js.map