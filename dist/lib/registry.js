"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.Block = exports.ItemArmor = exports.ItemTool = exports.ItemBlock = exports.Item = exports.ItemStack = exports.Registry = void 0;
const fs = __importStar(require("fs"));
class Registry {
    constructor(server) {
        this.items = {};
        this.blocks = {};
        this.commands = {};
        this.blockPalette = {};
        this.blockIDmap = {};
        this._blockRegistryObject = {};
        this._itemRegistryObject = {};
        this._freeIDs = [];
        this._lastID = 0;
        this.finalized = false;
        this._server = null;
        this._server = server;
        this.blocks['air'] = new Block('air', -1, '', { solid: false }, 0, 0, 'any');
        this.blocks['air'].rawid = 0;
        this.blockIDmap[0] = 'air';
        this.blockPalette['air'] = 0;
    }
    _loadPalette() {
        if (!this.finalized && fs.existsSync('./worlds/blocks.json')) {
            this._server.emit('palette-preload');
            try {
                const file = fs.readFileSync('./worlds/blocks.json');
                const json = JSON.parse(file.toString());
                this._server.emit('palette-loaded', json);
                this.blockPalette = { ...this.blockPalette, ...json };
                const usedIDs = Object.values(this.blockPalette);
                if (usedIDs.length == 0)
                    return;
                this._lastID = usedIDs[usedIDs.length - 1];
                let x = 0;
                for (let y = 0; y < usedIDs.length; y++) {
                    x = usedIDs[y];
                    for (; x <= this._lastID; x++) {
                        if (usedIDs[y] > x) {
                            this._freeIDs.push(x);
                        }
                        else
                            break;
                    }
                }
                this._server.emit('palette-finished', this.blockPalette);
            }
            catch (e) {
                this._server.emit('palette-error', e);
            }
        }
    }
    addItem(item) {
        if (!this.finalized) {
            this._server.emit('item-predefine', item);
            this.items[item.id] = item;
            this._server.emit('item-define', item);
        }
    }
    addBlock(block) {
        if (!this.finalized) {
            this._server.emit('block-predefine', block);
            this.blocks[block.id] = block;
            this._server.emit('block-define', block);
        }
    }
    addCommand(command) {
        this._server.emit('command-predefine', command);
        this.commands[command.command] = command;
        this._server.emit('command-define', command);
    }
    _finalize(force = false) {
        if (this.finalized && !force)
            return;
        this._server.emit('registry-prefinalize');
        const items = Object.keys(this.items);
        const blocks = Object.keys(this.blocks);
        items.forEach((name) => {
            this.items[name]._finalize(this);
            this._itemRegistryObject[name] = this.items[name].getObject();
        });
        blocks.forEach((name) => {
            this.blocks[name]._finalize(this);
            this._blockRegistryObject[name] = this.blocks[name].getObject();
        });
        delete this._blockRegistryObject['air'];
        this.finalized = true;
        const list = Object.entries(this.blockPalette);
        list.forEach((x) => {
            this.blockIDmap[x[1]] = x[0];
        });
        fs.writeFile('./worlds/blocks.json', JSON.stringify(this.blockPalette), function (err) {
            if (err)
                console.error('Cant save block palette! Reason: ' + err);
        });
        this._server.emit('registry-finalize');
    }
}
exports.Registry = Registry;
class ItemStack {
    constructor(id, count, data, registry) {
        this.id = id;
        this.count = count;
        this.data = data;
        //this.item = registry.items[id];
    }
    getObject() {
        return {
            id: this.id,
            count: this.count,
            data: this.data,
        };
    }
}
exports.ItemStack = ItemStack;
class Item {
    constructor(id, name, texture, stack) {
        this.registry = null;
        this.id = id;
        this.name = name;
        this.texture = texture;
        this.stack = stack;
    }
    getItemStack(count) {
        const number = count != undefined ? count : 1;
        return new ItemStack(this.id, number, {}, this.registry);
    }
    getObject() {
        return {
            id: this.id,
            name: this.name,
            texture: this.texture,
            stack: this.stack,
            type: this.constructor.name,
        };
    }
    _finalize(registry) {
        if (!registry.finalized) {
            this.registry = registry;
        }
    }
}
exports.Item = Item;
class ItemBlock extends Item {
    constructor(id, name, texture, stack, block, flat) {
        super(id, name, texture, stack);
        this.blockID = block;
        this.flat = flat;
    }
    getObject() {
        return {
            id: this.id,
            name: this.name,
            texture: this.texture,
            stack: this.stack,
            type: this.constructor.name,
            block: this.blockID,
            flat: this.flat,
        };
    }
    _finalize(registry) {
        if (!registry.finalized) {
            this.registry = registry;
            if (registry.blocks[this.blockID] != undefined)
                this.block = registry.blocks[this.blockID];
        }
    }
}
exports.ItemBlock = ItemBlock;
class ItemTool extends Item {
    constructor(id, name, texture, type, durability, power, speed) {
        super(id, name, texture, 1);
        this.type = type;
        this.durability = durability;
    }
    getObject() {
        return {
            id: this.id,
            name: this.name,
            texture: this.texture,
            stack: this.stack,
            type: this.constructor.name,
            toolType: this.type,
            durability: this.durability,
        };
    }
    canMine(b) {
        let block;
        if (typeof b == 'string') {
            if (this.registry.blocks[b] != undefined)
                block = this.registry.blocks[b];
            else
                return false;
        }
        if (block.unbreakable)
            return false;
        let tool;
        let power;
        if (Array.isArray(block.tool))
            tool = block.tool.includes(this.type);
        else if (block.tool == this.type)
            tool = true;
        if (block.hardness <= this.power)
            power = true;
        else
            power = false;
        return tool && power;
    }
}
exports.ItemTool = ItemTool;
class ItemArmor extends Item {
    constructor(id, name, texture, type, durability, reduction) {
        super(id, name, texture, 1);
        this.type = type;
        this.durability = durability;
    }
    getReducedDamage(x) {
        return x - (x * this.reduction) / 100;
    }
    getObject() {
        return {
            id: this.id,
            name: this.name,
            texture: this.texture,
            stack: this.stack,
            type: this.constructor.name,
            armorType: this.type,
            durability: this.durability,
        };
    }
}
exports.ItemArmor = ItemArmor;
class Block {
    constructor(id, type, texture, options, hardness, miningtime, tool) {
        this.rawid = -1;
        this.registry = null;
        this.id = id;
        this.texture = texture;
        this.options = options;
        this.hardness = hardness;
        this.miningtime = miningtime;
        this.tool = tool;
        this.type = type;
    }
    getItemStack(count) {
        const number = count != undefined ? count : 1;
        return new ItemStack(this.id, number, {}, this.registry);
    }
    getObject() {
        return {
            rawid: this.rawid,
            id: this.id,
            texture: this.texture,
            options: this.options,
            hardness: this.hardness,
            miningtime: this.miningtime,
            tool: this.tool,
            type: this.type,
            unbreakable: this.unbreakable,
        };
    }
    getRawID() {
        return this.rawid;
    }
    _finalize(registry) {
        if (!registry.finalized) {
            this.registry = registry;
            if (registry.blockPalette[this.id] != undefined)
                this.rawid = registry.blockPalette[this.id];
            else {
                if (registry._freeIDs.length > 0) {
                    this.rawid = registry._freeIDs[0];
                    registry._freeIDs.shift();
                    registry.blockPalette[this.id] = this.rawid;
                }
                else {
                    registry._lastID++;
                    this.rawid = registry._lastID;
                    registry.blockPalette[this.id] = this.rawid;
                }
            }
        }
    }
}
exports.Block = Block;
class Command {
    constructor(command, func, description = 'Custom command') {
        this.command = null;
        this.trigger = () => { };
        (this.command = command), (this.description = description), (this.trigger = func);
    }
}
exports.Command = Command;
//# sourceMappingURL=registry.js.map