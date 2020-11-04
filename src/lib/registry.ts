import * as fs from 'fs';
import type { Server } from '../server';

export class Registry {
	items: { [index: string]: any } = {};
	blocks: { [index: string]: any } = {};
	commands: { [index: string]: any } = {};
	blockPalette: { [index: string]: number } = {};
	blockIDmap: { [index: number]: string } = {};

	_blockRegistryObject: { [index: string]: object } = {};
	_itemRegistryObject: { [index: string]: object } = {};
	_freeIDs: number[] = [];
	_lastID = 0;
	finalized: boolean = false;

	_server: Server = null;

	constructor(server: Server) {
		this._server = server;

		this.blocks['air'] = new Block('air', -1, '', {solid: false}, 0, 0, 'any');
		this.blocks['air'].rawid = 0;
		this.blockIDmap[0] = 'air';
		this.blockPalette['air'] = 0;
	}

	_loadPalette(): void {
		if (!this.finalized && fs.existsSync('./worlds/blocks.json')) {
			this._server.emit('palette-preload');
			try {
				const file = fs.readFileSync('./worlds/blocks.json');
				const json = JSON.parse(file.toString());

				this._server.emit('palette-loaded', json);

				this.blockPalette = { ...this.blockPalette, ...json };

				const usedIDs = Object.values(this.blockPalette);

				if (usedIDs.length == 0) return;

				this._lastID = usedIDs[usedIDs.length - 1];

				let x = 0;
				for (let y = 0; y < usedIDs.length; y++) {
					x = usedIDs[y];
					for (; x <= this._lastID; x++) {
						if (usedIDs[y] > x) {
							this._freeIDs.push(x);
						} else break;
					}
				}

				this._server.emit('palette-finished', this.blockPalette);
			} catch (e) {
				this._server.emit('palette-error', e);
			}
		}
	}

	addItem(item: Item): void {
		if (!this.finalized) {
			this._server.emit('item-predefine', item);
			this.items[item.id] = item;
			this._server.emit('item-define', item);
		}
	}

	addBlock(block: Block): void {
		if (!this.finalized) {
			this._server.emit('block-predefine', block);
			this.blocks[block.id] = block;
			this._server.emit('block-define', block);
		}
	}

	addCommand(command: Command): void {
		this._server.emit('command-predefine', command);
		this.commands[command.command] = command;
		this._server.emit('command-define', command);
	}

	_finalize(force: boolean = false): void {
		if (this.finalized && !force) return;

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
			if (err) console.error('Cant save block palette! Reason: ' + err);
		});

		this._server.emit('registry-finalize');
	}
}

export interface IItemStack {
	id: string;
	count: number;
	stack: number;
	item: IItem;
	[propName: string]: any;
}

export class ItemStack {
	id: string;
	count: number;
	data: object;

	constructor(id: string, count: number, data: object, registry: Registry) {
		this.id = id;
		this.count = count;
		this.data = data;

		//this.item = registry.items[id];
	}

	getObject(): object {
		return {
			id: this.id,
			count: this.count,
			data: this.data,
		};
	}
}

/*
 *
 * Items
 *
 */

export interface IItem {
	id: string;
	name: string;
	texture: string | Array<string>;
	stack: number;
	[propName: string]: any;
}

export class Item {
	id: string;
	name: string;
	texture: string | Array<string>;
	stack: number;
	registry: Registry = null;

	constructor(id: string, name: string, texture: string | string[], stack: number) {
		this.id = id;
		this.name = name;
		this.texture = texture;
		this.stack = stack;
	}

	getItemStack(count?: number): ItemStack {
		const number = count != undefined ? count : 1;
		return new ItemStack(this.id, number, {}, this.registry);
	}

	getObject(): object {
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

export class ItemBlock extends Item {
	block: any;
	blockID: string;
	flat: boolean;
	constructor(id: string, name: string, texture: string | string[], stack: number, block: string, flat: boolean) {
		super(id, name, texture, stack);
		this.blockID = block;
		this.flat = flat;
	}

	getObject(): object {
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
			if (registry.blocks[this.blockID] != undefined) this.block = registry.blocks[this.blockID];
		}
	}
}

export class ItemTool extends Item {
	type: string;
	durability: number;
	power: number;
	speed: number;

	constructor(id: string, name: string, texture: string, type: string, durability: number, power: number, speed: number) {
		super(id, name, texture, 1);
		this.type = type;
		this.durability = durability;
	}

	getObject(): object {
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

	canMine(b: Block | string) {
		let block: Block;
		if (typeof b == 'string') {
			if (this.registry.blocks[b] != undefined) block = this.registry.blocks[b];
			else return false;
		}

		if (block.unbreakable) return false;

		let tool: boolean;
		let power: boolean;

		if (Array.isArray(block.tool)) tool = block.tool.includes(this.type);
		else if (block.tool == this.type) tool = true;

		if (block.hardness <= this.power) power = true;
		else power = false;

		return tool && power;
	}
}

export class ItemArmor extends Item {
	type: string;
	durability: number;
	reduction: number;

	constructor(id: string, name: string, texture: string, type: string, durability: number, reduction: number) {
		super(id, name, texture, 1);
		this.type = type;
		this.durability = durability;
	}

	getReducedDamage(x: number): number {
		return x - (x * this.reduction) / 100;
	}

	getObject(): object {
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

/*
 *
 * Blocks
 *
 */

export interface IBlock {
	id: string;
	name: string;
	texture: string | Array<string>;
	[propName: string]: any;
}

export class Block {
	rawid: number = -1;
	id: string;
	type: number;
	texture: string | Array<string>;
	options: object;
	hardness: number;
	unbreakable: boolean;
	miningtime: number;
	tool: string | string[];
	registry: Registry = null;

	constructor(id: string, type: number, texture: string | string[], options: object, hardness: number, miningtime: number, tool: string | string[]) {
		this.id = id;
		this.texture = texture;
		this.options = options;
		this.hardness = hardness;
		this.miningtime = miningtime;
		this.tool = tool;
		this.type = type;
	}

	getItemStack(count?: number): ItemStack {
		const number = count != undefined ? count : 1;
		return new ItemStack(this.id, number, {}, this.registry);
	}

	getObject(): object {
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

	getRawID(): number {
		return this.rawid;
	}

	_finalize(registry: Registry) {
		if (!registry.finalized) {
			this.registry = registry;
			if (registry.blockPalette[this.id] != undefined) this.rawid = registry.blockPalette[this.id];
			else {
				if (registry._freeIDs.length > 0) {
					this.rawid = registry._freeIDs[0];
					registry._freeIDs.shift();
					registry.blockPalette[this.id] = this.rawid;
				} else {
					registry._lastID++;
					this.rawid = registry._lastID;
					registry.blockPalette[this.id] = this.rawid;
				}
			}
		}
	}
}

export class Command {
	command: string = null;
	description: string;
	trigger: Function = () => {};
	constructor(command: string, func: Function, description: string = 'Custom command') {
		(this.command = command), (this.description = description), (this.trigger = func);
	}
}
