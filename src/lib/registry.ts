import * as fs from 'fs';
import type { Server } from '../server';
import type { ICoreRegistry, ICoreBasicBlock, ICoreBasicItem, ICoreCommand } from 'voxelservercore/interfaces/registry';
import { BlockDef, ItemDef } from 'voxelsrv-protocol/js/client';
import { ChatMessage, convertToPlain, MessageBuilder } from './chat';

export class Registry implements ICoreRegistry {
	items: { [index: string]: any } = {};
	blocks: { [index: string]: any } = {};
	commands: { [index: string]: any } = {};
	blockPalette: { [index: string]: number } = {};
	blockIDmap: { [index: number]: string } = {};

	_blockRegistryObject: BlockDef[] = [];
	_itemRegistryObject: ItemDef[] = [];
	_freeIDs: number[] = [];
	_lastID = 0;
	finalized: boolean = false;

	_server: Server = null;

	constructor(server: Server) {
		this._server = server;

		this.blocks['air'] = new Block('air', { solid: false });
		this.blocks['air'].numId = 0;
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
			this._itemRegistryObject.push(this.items[name].getObject());
		});
		blocks.forEach((name) => {
			this.blocks[name]._finalize(this);
			this._blockRegistryObject.push(this.blocks[name].getObject());
		});

		delete this._blockRegistryObject['air'];

		this.finalized = true;

		const list = Object.entries(this.blockPalette);
		list.forEach((x) => {
			this.blockIDmap[x[1]] = x[0];
		});

		fs.writeFile('./worlds/blocks.json', JSON.stringify(this.blockPalette), function (err) {
			if (err) this._server.log.error('Cant save block palette! Reason: ' + err);
		});

		this._server.emit('registry-finalize');
	}
}

export interface IItemStack {
	id: string;
	count: number;
	stack: number;
	item: ICoreBasicItem;
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

export class Item implements ICoreBasicItem {
	id: string;
	numId: number;
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
			name: [{ text: this.name }],
			textures: [this.texture],
			maxStack: this.stack,
			toolType: [],
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

		tool = block.toolType.includes(this.type) || block.toolType.includes('*');

		if (block.miningPower <= this.power) power = true;
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
}

/*
 *
 * Blocks
 *
 */

export interface BlockData {
	textures?: string[];
	type?: BlockDef.Type;
	toolType?: string[];
	miningSpeed?: number;
	miningPower?: number;
	solid?: boolean;
	fluid?: boolean;
	opaque?: boolean;
	color?: [number, number, number, number?];
	material?: string[];
	fluidDensity?: number;
	viscosity?: number;
	customModel?: string;
	unbreakable?: boolean;
}

export class Block implements ICoreBasicBlock {
	numId: number = -1;
	id: string;
	name: string;
	type: BlockDef.Type;
	_registry: Registry = null;
	toolType: string[];
	textures: string[];
	miningPower: number;
	miningSpeed: number;
	solid: boolean;
	fluid: boolean;
	opaque: boolean;
	color: number[];
	material: string[];
	fluidDensity: number;
	viscosity: number;
	customModel: string;
	unbreakable: boolean;

	constructor(id: string, data: BlockData) {
		this.id = id;
		this.name = id;
		this.type = data.type ?? BlockDef.Type.BLOCK;
		this.textures = data.textures ?? [];
		this.toolType = data.toolType ?? ['*'];
		this.miningSpeed = data.miningSpeed ?? 2;
		this.miningPower = data.miningPower ?? 2;
		this.solid = data.solid ?? true;
		this.fluid = data.fluid ?? false;
		this.opaque = data.opaque ?? true;
		this.color = data.color ?? [0, 0, 0];
		this.material = data.material ?? [];
		this.fluidDensity = data.fluidDensity ?? 0;
		this.viscosity = data.viscosity ?? 0;
		this.customModel = data.customModel ?? '';
		this.unbreakable = data.unbreakable ?? false;
	}

	getItemStack(count?: number): ItemStack {
		const number = count != undefined ? count : 1;
		return new ItemStack(this.id, number, {}, this._registry);
	}

	getObject(): object {
		return {
			numId: this.numId,
			id: this.id,
			type: this.type,
			textures: this.textures,
			toolType: this.toolType,
			miningSpeed: this.miningSpeed,
			miningPower: this.miningPower,
			solid: this.solid,
			fluid: this.fluid,
			opaque: this.opaque,
			color: this.color,
			material: this.material,
			fluidDensity: this.fluidDensity,
			viscosity: this.viscosity,
			customModel: this.customModel,
			unbreakable: this.unbreakable,
		};
	}

	_finalize(registry: Registry) {
		if (!registry.finalized) {
			this._registry = registry;
			if (registry.blockPalette[this.id] != undefined) this.numId = registry.blockPalette[this.id];
			else {
				if (registry._freeIDs.length > 0) {
					this.numId = registry._freeIDs[0];
					registry._freeIDs.shift();
					registry.blockPalette[this.id] = this.numId;
				} else {
					registry._lastID++;
					this.numId = registry._lastID;
					registry.blockPalette[this.id] = this.numId;
				}
			}
		}
	}
}

export class Command implements ICoreCommand {
	command: string = null;
	description: string;
	trigger;
	constructor(command: string, func: Function, description: string = 'Custom command') {
		(this.command = command), (this.description = description), (this.trigger = func);
	}
}
