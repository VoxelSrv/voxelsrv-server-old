"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmorInventory = void 0;
const generalInventory_1 = require("./generalInventory");
class ArmorInventory extends generalInventory_1.Inventory {
    constructor(data, server) {
        super(0.55, data, server);
    }
    getHelmet() {
        return this.items[0];
    }
    getChestplate() {
        return this.items[1];
    }
    getLeggings() {
        return this.items[2];
    }
    getBoots() {
        return this.items[3];
    }
}
exports.ArmorInventory = ArmorInventory;
//# sourceMappingURL=armorInventory.js.map