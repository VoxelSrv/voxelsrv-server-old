import { BlockDef } from 'voxelsrv-protocol/js/client';
import { Block, Registry } from '../lib/registry';

export function setup(registry: Registry) {
	registry.addBlock(new Block('stone', { textures: ['block/stone'] }));
	registry.addBlock(new Block('dirt', { textures: ['block/dirt'] }));
	registry.addBlock(new Block('grass', { textures: ['block/grass_top', 'block/dirt', 'block/grass_side'] }));
	registry.addBlock(new Block('grass_snow', { textures: ['block/snow', 'block/dirt', 'block/grass_snow'] }));
	registry.addBlock(new Block('cobblestone', { textures: ['block/cobblestone'] }));
	registry.addBlock(new Block('log', { textures: ['block/log_top', 'block/log'] }));
	registry.addBlock(new Block('sand', { textures: ['block/sand'] }));
	registry.addBlock(new Block('leaves', { textures: ['block/leaves'], opaque: false }));

	registry.addBlock(new Block('water', { color: [0.5, 0.5, 0.8, 0.7], fluid: true, fluidDensity: 0, viscosity: 0, opaque: false, solid: false }));

	registry.addBlock(new Block('red_flower', { type: BlockDef.Type.CROSS, textures: ['block/red_flower'], solid: false, opaque: false }));
	registry.addBlock(new Block('grass_plant', { type: BlockDef.Type.CROSS, textures: ['block/grass_plant'], solid: false, opaque: false }));
	registry.addBlock(new Block('yellow_flower', { type: BlockDef.Type.CROSS, textures: ['block/yellow_flower'], solid: false, opaque: false }));
	registry.addBlock(new Block('bricks', { textures: ['block/bricks'] }));
	registry.addBlock(new Block('planks', { textures: ['block/planks'] }));
	registry.addBlock(new Block('glass', { textures: ['block/glass'], opaque: false }));
	registry.addBlock(new Block('bookshelf', { textures: ['block/planks', 'block/bookshelf'] }));

	registry.addBlock(new Block('barrier', { color: [0, 0, 0, 0], opaque: false }));

	registry.addBlock(new Block('snow', { textures: ['block/snow'] }));
	registry.addBlock(new Block('coal_ore', { textures: ['block/coal_ore'] }));
	registry.addBlock(new Block('iron_ore', { textures: ['block/iron_ore'] }));
	registry.addBlock(new Block('cactus', { textures: ['block/cactus_top', 'block/cactus_side', 'block/cactus_bottom'], opaque: false }));
	registry.addBlock(new Block('deadbush', { type: BlockDef.Type.CROSS, textures: ['block/dead_bush'], solid: false, opaque: false }));
	registry.addBlock(new Block('gravel', { textures: ['block/gravel'] }));

	registry.addBlock(new Block('crafting', { textures: ['block/crafting_table_top', 'block/oak_planks', 'block/crafting_table_side'] }));

	registry.addBlock(new Block('stonebrick', { textures: ['block/stonebrick'] }));

	var colors = [
		'white',
		'yellow',
		'red',
		'purple',
		'pink',
		'orange',
		'magenta',
		'lime',
		'light_blue',
		'green',
		'gray',
		'cyan',
		'brown',
		'blue',
		'black',
	];

	colors.forEach((color) => {
		registry.addBlock(new Block(color + '_wool', { textures: ['block/' + color + '_wool'] }));
	});

	colors.forEach((color) => {
		registry.addBlock(
			new Block(color + '_stained_glass', { type: BlockDef.Type.TRANSPARENT, textures: ['block/' + color + '_stained_glass'], opaque: false })
		);
	});

	registry.addBlock(new Block('birch_log', { textures: ['block/birch_log_top', 'block/birch_log'] }));
	registry.addBlock(new Block('birch_leaves', { textures: ['block/birch_leaves'], opaque: false }));
	registry.addBlock(new Block('birch_planks', { textures: ['block/birch_planks'] }));

	registry.addBlock(new Block('spruce_log', { textures: ['block/spruce_log_top', 'block/spruce_log'] }));
	registry.addBlock(new Block('spruce_leaves', { textures: ['block/spruce_leaves'], opaque: false }));
	registry.addBlock(new Block('spruce_planks', { textures: ['block/spruce_planks'] }));

	registry.addBlock(new Block('iron_block', { textures: ['block/iron_block'] }));
	registry.addBlock(new Block('gold_block', { textures: ['block/gold_block'] }));

	registry.addBlock(new Block('bedrock', { textures: ['block/bedrock'], unbreakable: true }));

	registry.addBlock(new Block('sandstone', { textures: ['block/sandstone'] }));
	registry.addBlock(new Block('diamond_ore', { textures: ['block/diamond_ore'] }));
	registry.addBlock(new Block('diamond_block', { textures: ['block/diamond_block'] }));
	registry.addBlock(new Block('lapis_ore', { textures: ['block/lapis_ore'] }));
	registry.addBlock(new Block('lapis_block', { textures: ['block/lapis_block'] }));
	registry.addBlock(new Block('mossy_cobblestone', { textures: ['block/mossy_cobblestone'] }));
	registry.addBlock(new Block('obsidian', { textures: ['block/obsidian'] }));
	registry.addBlock(new Block('mossy_stonebricks', { textures: ['block/mossy_stone_bricks'] }));

	colors.forEach((color) => {
		registry.addBlock(new Block(color + '_concrete', { textures: ['block/' + color + '_concrete'] }));
	});

	registry.addBlock(new Block('tnt', { textures: ['block/tnt_top', 'block/tnt_bottom', 'block/tnt_side'] }));
	registry.addBlock(new Block('pumpkin', { textures: ['block/pumpkin_top', 'block/pumpkin_side', 'block/pumpkin_side'] }));
	registry.addBlock(new Block('oak_sapling', { type: BlockDef.Type.CROSS, textures: ['block/oak_sapling'], solid: false, opaque: false }));

	registry.addBlock(new Block('ice', { textures: ['block/ice'] }));

	registry.addBlock(new Block('grass_yellow', { textures: ['block/grass_yellow_top', 'block/dirt', 'block/grass_yellow_side'] }));
	registry.addBlock(
		new Block('grass_plant_yellow', { type: BlockDef.Type.CROSS, textures: ['block/grass_plant_yellow'], solid: false, opaque: false })
	);
	registry.addBlock(new Block('leaves_yellow', { textures: ['block/leaves_yellow'], opaque: false }));
}
