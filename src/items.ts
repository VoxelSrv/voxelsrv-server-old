//import blocks from './blocks'

export const registry = {}

export type ItemTypes = 'block' | 'block-flat' | 'item' | 'pickaxe' | 'shovel' | 'axe'

class Item {
	id: string
	name: string
	type: ItemTypes
	texture: string | Array<string>
	stack: number
	miningPower: number | null
	durability: number | null
	block: string | null

	constructor(id, name, type, texture, stack, miningPower, durability, block) {
		this.id = id
		this.name = name
		this.type = type
		this.texture = texture
		this.stack = stack
		if (type == ('block' || 'block-flat') ) { 
			this.block = block
			this.miningPower = null
			this.durability = null
		} else {
			this.block = null
			this.miningPower = miningPower
			this.durability = durability
		}
	}

	canMine(blockid: string ): boolean {
		return true // Temp
	}

	getObject(): object {
		return {
			id: this.id,
			name: this.name,
			type: this.type,
			texture: this.texture,
			stack: this.stack,
			miningPower: this.miningPower,
			durability: this.durability
		}
	}

	// Also temp
	getLegacyObject(): object {
		return {
			name: this.name,
			type: this.type,
			texture: this.texture,
			data: {
				stack: this.stack,
				power: this.miningPower,
				durability: this.durability
			}
		}
	}
}

export function initDefaultItems(): void {

	//Format of createItem - id, name, type, texture, attributes

	// Tools

	// Blocks
	createBlockItem('stone', 'Stone', false, 'block/stone', 64, null );
	createBlockItem('dirt', 'Dirt', false, 'block/dirt', 64, null );
	createBlockItem('grass', 'Grass block', false, 'block/grass_side', 64, null );
	createBlockItem('grass_snow', 'Snowy grass block', false, 'block/grass_snow', 64, null );
	createBlockItem('cobblestone', 'Cobblestone', false, 'block/cobblestone', 64, null );
	createBlockItem('log', 'Log', false, 'block/log', 64, null );
	createBlockItem('sand', 'Sand', false, 'block/sand', 64, null );
	createBlockItem('leaves', 'Leaves', false, 'block/leaves', 64, null );

	createBlockItem('red_flower', 'Poppy', true, 'block/red_flower', 64, null );
	createBlockItem('grass_plant', 'Grass', true, 'block/grass_plant', 64, null );
	createBlockItem('yellow_flower', 'Dandelion', true, 'block/yellow_flower', 64, null );
	createBlockItem('deadbush', 'Dead bush', true, 'block/deadbush', 64, null );


	createBlockItem('bricks', 'Bricks', false, 'block/bricks', 64, null );
	createBlockItem('planks', 'Planks', false, 'block/planks', 64, null );
	createBlockItem('glass', 'Glass', false, 'block/glass', 64, null );
	createBlockItem('bookshelf', 'Bookshelf', false, 'block/bookshelf', 64, null );
	createBlockItem('snow', 'Snow block', false, 'block/snow', 64, null );
	createBlockItem('coal_ore', 'Coal ore', false, 'block/coal_ore', 64, null );
	createBlockItem('iron_ore', 'Iron ore', false, 'block/iron_ore', 64, null );

	createBlockItem('cactus', 'Cactus', false, 'block/cactus_side', 64, null );

	createBlockItem('stonebrick', 'Stone brick', false, 'block/stonebrick', 64, null );


	const colors = ['white', 'yellow', 'red', 'purple', 'pink', 'orange', 'magenta', 'lime', 'light_blue', 'green', 'gray', 'cyan', 'brown', 'blue', 'black'];


	colors.forEach(function(color) {
		createBlockItem(color + '_wool', color + '_wool', false, 'block/'+ color + '_wool', 64, null );
	})
	colors.forEach(function(color) {
		createBlockItem(color + '_stained_glass', color + '_stained_glass', false, 'block/'+ color + '_stained_glass', 64, null );
	})

	createBlockItem('birch_leaves', 'Birch leaves', false, 'block/birch_leaves', 64, null );
	createBlockItem('birch_log', 'Birch log', false, 'block/birch_log', 64, null );
	createBlockItem('birch_planks', 'Birch planks', false, 'block/birch_planks', 64, null );

	createBlockItem('spruce_leaves', 'Spruce leaves', false, 'block/spruce_leaves', 64, null );
	createBlockItem('spruce_log', 'Spruce log', false, 'block/spruce_log', 64, null );
	createBlockItem('spruce_planks', 'Spruce planks', false, 'block/spruce_planks', 64, null );

	createBlockItem('iron_block', 'Iron block', false, 'block/iron_block', 64, null );
	createBlockItem('gold_block', 'Gold block', false, 'block/gold_block', 64, null );

	createBlockItem('crafting', 'Crafting table', false, 'block/crafting_table_top', 64, null );

}


export function createItem(
	id: string, 
	name: string, 
	type: ItemTypes, 
	texture: string | Array<string>, 
	stack: number, 
	miningPower: number, 
	durability: number
): void {
	registry[id] = new Item(id, name, type, texture, stack, miningPower, durability, null);
};

export function createBlockItem(
	id: string, 
	name: string, 
	flat: boolean,
	texture: string | Array<string>, 
	stack: number, 
	block: string | null
): void {
	if (block != null ) registry[id] = new Item(id, name, ( (flat) ? 'block-flat' : 'block' ), texture, stack, null, null, block);
	else registry[id] = new Item(id, name, ( (flat) ? 'block-flat' : 'block' ), texture, stack, null, null, id)
};

export function get(id): Item { return registry[id] };