import * as fs from 'fs';
import { EventEmitter } from 'events';

export const itemRegistry: { [index: string]: any } = {};
export const blockRegistry: { [index: string]: any } = {};
export let blockPalette: { [index: string]: number } = {};
export const blockIDmap: { [index: number]: string } = {};

export const blockRegistryObject: { [index: string]: object } = {};
export const itemRegistryObject: { [index: string]: object } = {};

export const event = new EventEmitter();
const freeIDs: number[] = [];
let lastID = 0;
let finalized: boolean = false;

export function loadPalette(): void {
	if (!finalized && fs.existsSync('./worlds/blocks.json')) {
		event.emit('palette-preload');
		try {
			const file = fs.readFileSync('./worlds/blocks.json');
			const json = JSON.parse(file.toString());

			event.emit('palette-loaded', json);

			blockPalette = json;

			const usedIDs = Object.values(blockPalette);

			if (usedIDs.length == 0) return;

			lastID = usedIDs[usedIDs.length - 1];

			let x = 0;
			for (let y = 0; y < usedIDs.length; y++) {
				x = usedIDs[y];
				for (; x <= lastID; x++) {
					if (usedIDs[y] > x) {
						freeIDs.push(x);
					} else break;
				}
			}

			event.emit('palette-finished', blockPalette);
		} catch (e) {
			event.emit('palette-error', e);
		}
	}
}

export function addItem(item: Item): void {
	if (!finalized) {
		event.emit('item-predefine', item);
		itemRegistry[item.id] = item;
		event.emit('item-define', item);
	}
}

export function addBlock(block: Block): void {
	if (!finalized) {
		event.emit('block-predefine', block);
		blockRegistry[block.id] = block;
		event.emit('block-define', block);
	}
}

export function finalize(force: boolean = false): void {
	if (finalized && !force) return;

	event.emit('registry-prefinalize');

	const items = Object.keys(itemRegistry);
	const blocks = Object.keys(blockRegistry);

	items.forEach((name) => {
		itemRegistry[name].finalize();
		itemRegistryObject[name] = itemRegistry[name].getObject();
	});
	blocks.forEach((name) => {
		blockRegistry[name].finalize();
		blockRegistryObject[name] = blockRegistry[name].getObject();
	});

	delete blockRegistryObject['air'];

	finalized = true;

	const list = Object.entries(blockPalette);
	list.forEach((x) => {
		blockIDmap[x[1]] = x[0];
	});

	fs.writeFile('./worlds/blocks.json', JSON.stringify(blockPalette), function (err) {
		if (err) console.error('Cant save block palette! Reason: ' + err);
	});

	event.emit('registry-finalize');
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
	item: any;

	constructor(id: string, count: number, data: object) {
		this.id = id;
		this.count = count;
		this.data = data;

		this.item = itemRegistry[id];
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

	constructor(id: string, name: string, texture: string | string[], stack: number) {
		this.id = id;
		this.name = name;
		this.texture = texture;
		this.stack = stack;
	}

	getItemStack(count?: number): ItemStack {
		const number = count != undefined ? count : 1;
		return new ItemStack(this.id, number, {});
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

	finalize() {
		if (!finalized) {
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

	finalize() {
		if (!finalized) {
			if (blockRegistry[this.blockID] != undefined) this.block = blockRegistry[this.blockID];
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
			if (blockRegistry[b] != undefined) block = blockRegistry[b];
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

	constructor(id: string, type: number, texture: string | string[], options: object, hardness: number, miningtime: number, tool: string | string[]) {
		if (blockPalette[id] != undefined) this.rawid = blockPalette[id];

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
		return new ItemStack(this.id, number, {});
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

	getRawID(object: object): number {
		return this.rawid;
	}

	finalize(): void {
		if (!finalized) {
			if (this.rawid == -1) {
				if (freeIDs.length > 0) {
					this.rawid = freeIDs[0];
					freeIDs.shift();
					blockPalette[this.id] = this.rawid;
				} else {
					lastID++;
					this.rawid = lastID;
					blockPalette[this.id] = this.rawid;
				}
			}
		}
	}
}

blockRegistry['air'] = new Block('air', -1, '', {}, 0, 0, 'any');
blockRegistry['air'].rawid = 0;
