import * as fs from 'fs'

export const itemRegistry: { [index: string]: any} = {};
export const blockRegistry: { [index: string]: any} = {};
export let blockPalette: { [index: string]: number} = {};
export const blockIDmap: { [index: number]: string} = {};

export const blockRegistryObject: { [index: string]: object} = {};
export const itemRegistryObject: { [index: string]: object} = {};


const freeIDs: number[] = []
let lastID = 0;

let finalized: boolean = false;


export function loadPalette(): void {
	if ( fs.existsSync('./worlds/blocks.json') ) {
		try {
			const file = fs.readFileSync('./worlds/blocks.json');
			const json = JSON.parse( file.toString() );

			blockPalette = json;

			const usedIDs = Object.values(blockPalette);

			if (usedIDs.length == 0) return;

			lastID = usedIDs[ usedIDs.length - 1 ];

			let x = 0;
			for (let y = 0; y < usedIDs.length; y++) {
				x = usedIDs[ y ];
				for (; x <= lastID; x++) {
					if ( usedIDs[ y ] > x ) {
						freeIDs.push(x);
					} else break;
				}
			}

		} catch(e) {}
	}
}


export function addItem(item: Item): void {
	if (!finalized) itemRegistry[ item.id ] = item;
}

export function addBlock(block: Block): void {
	if (!finalized) blockRegistry[ block.id ] = block;
}

export function finalize(): void {
	if (finalized) return;

	const items = Object.keys(itemRegistry);
	const blocks = Object.keys(blockRegistry);

	items.forEach( (name) => { 
		itemRegistry[ name ].finalize();
		itemRegistryObject[ name ] = itemRegistry[ name ].getObject();
	});
	blocks.forEach( (name) => { 
		blockRegistry[name].finalize();
		blockRegistryObject[ name ] = blockRegistry[ name ].getObject();
	 });

	finalized = true;

	const list = Object.entries(blockPalette);
	list.forEach( (x) => { blockIDmap[ x[1] ] = x[0] });

	fs.writeFile( './worlds/blocks.json', JSON.stringify( blockPalette ), function (err) {
		if (err) console.error ('Cant save block palette! Reason: ' + err);
	})

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
			data: this.data
		};
	}
}

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
		const number = (count != undefined) ? count : 1;
		return new ItemStack(this.id, number, {})
	}

	getObject(): object {
		return {
			id: this.id,
			name: this.name,
			texture: this.texture,
			stack: this.stack,
			type: this.constructor.name
		};
	}

	finalize() {
		if (!finalized) {
		
		}
	}
}




export interface IBlock {
	id: string;
	name: string;
	texture: string | Array<string>;
	[propName: string]: any;
}

export class Block {
	rawid: number = 0;
	id: string;
	type: number;
	texture: string | Array<string>;
	options: object;
	hardness: number;
	unbreakable: boolean;
	miningtime: number;
	tool: string;

	constructor(id: string, type: number, texture: string | string[], options: object, hardness: number, miningtime: number, tool: string ) {
		if ( blockPalette[ id ] != undefined ) this.rawid = blockPalette[ id ]

		this.id = id;
		this.texture = texture;
		this.options = options;
		this.hardness = hardness;
		this.miningtime = miningtime;
		this.tool = tool;
		this.type = type;

	}

	getItemStack(count?: number): ItemStack {
		const number = (count != undefined) ? count : 1;
		return new ItemStack(this.id, number, {})
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
			unbreakable: this.unbreakable
		};
	}

	getRawID(object: object): number {
		return this.rawid;
	} 

	finalize(): void {
		if (!finalized) {
			if (this.rawid == 0) {
				if (freeIDs.length > 0) {
					this.rawid = freeIDs[0];
					freeIDs.shift();
					blockPalette[ this.id ] = this.rawid
				} else {
					lastID++;
					this.rawid = lastID;
					blockPalette[ this.id ] = this.rawid
				}
			}
		}
	}
}



export class ItemBlock extends Item {
	block: any;
	blockID: string;
	flat: boolean;
	constructor(id: string, name: string, texture: string | string[], stack: number, block: string, flat: boolean ) {
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
			flat: this.flat
		};
	}

	finalize() {
		if (!finalized) {
			if ( blockRegistry[ this.blockID ] != undefined ) this.block = blockRegistry[ this.blockID ]
		}
	}
}
