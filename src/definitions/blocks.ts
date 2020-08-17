import { addBlock, Block } from '../registry'

addBlock( new Block('stone', 0, ['block/stone'], {}, 0, 0, 'any') );
addBlock( new Block('dirt', 0, ['block/dirt'], {}, 0, 0, 'any') ); 
addBlock( new Block('grass', 0, ['block/grass_top', 'block/dirt', 'block/grass_side'], {}, 0, 0, 'any') );
addBlock( new Block('grass_snow', 0, ['block/snow', 'block/dirt', 'block/grass_snow'], {}, 0, 0, 'any') );
addBlock( new Block('cobblestone', 0, ['block/cobblestone'], {}, 0, 0, 'any') );
addBlock( new Block('log', 0, ['block/log_top', 'block/log'], {}, 0, 0, 'any') );
addBlock( new Block('sand', 0, ['block/sand'], {}, 0, 0, 'any') );
addBlock( new Block('leaves', 0, ['block/leaves'], {opaque: false}, 0, 0, 'any') );

addBlock( new Block('water', 0, ['block/water'], {material: 'water', fluid: true, fluidDensity: 20.0, viscosity: 20.5 }, 0, 0, 'any') );

addBlock( new Block('red_flower', 1, ['block/red_flower'], {solid: false, opaque: false}, 0, 0, 'any') );
addBlock( new Block('grass_plant', 1, ['block/grass_plant'], {solid: false, opaque: false}, 0, 0, 'any') );
addBlock( new Block('yellow_flower', 1, ['block/yellow_flower'], {solid: false, opaque: false}, 0, 0, 'any') );
addBlock( new Block('bricks', 0, ['block/bricks'], {}, 0, 0, 'any') );
addBlock( new Block('planks', 0, ['block/planks'], {}, 0, 0, 'any') );
addBlock( new Block('glass', 0, ['block/glass'], {opaque: false}, 0, 0, 'any') );
addBlock( new Block('bookshelf', 0, ['block/planks', 'block/bookshelf'], {}, 0, 0, 'any') );

addBlock( new Block('barrier', 0, [], {material: 'barrier'}, 0, 0, 'any' ) );

addBlock( new Block('snow', 0, ['block/snow'], {}, 0, 0, 'any') );
addBlock( new Block('coal_ore', 0, ['block/coal_ore'], {}, 0, 0, 'any') );
addBlock( new Block('iron_ore', 0, ['block/iron_ore'], {}, 0, 0, 'any') );
addBlock( new Block('cactus', 2, ['block/cactus_top', 'block/cactus_side'], {opaque: false}, 0, 0, 'any') );
addBlock( new Block('deadbush', 1, ['block/deadbush'], {solid: false, opaque: false}, 0, 0, 'any') );
addBlock( new Block('gravel', 0, ['block/gravel'], {}, 0, 0, 'any') );

addBlock( new Block('crafting', 0, ['block/crafting_table_top', 'block/oak_planks', 'block/crafting_table_side'], {}, 0, 0, 'any') );

addBlock( new Block('stonebrick', 0, ['block/stonebrick'], {}, 0, 0, 'any') );

var colors = ['white', 'yellow', 'red', 'purple', 'pink', 'orange', 'magenta', 'lime', 'light_blue', 'green', 'gray', 'cyan', 'brown', 'blue', 'black']

colors.forEach( (color) => {
	addBlock( new Block(color + '_wool', 0, ['block/' + color + '_wool' ] , {}, 0, 0, 'any') );
});

colors.forEach( (color) => {
	addBlock( new Block(color + '_stained_glass', 4, ['block/' + color + '_stained_glass' ] , {opaque: false}, 0, 0, 'any') );
});


addBlock( new Block('birch_log', 0, ['block/birch_log_top', 'block/birch_log'], {}, 0, 0, 'any') );
addBlock( new Block('birch_leaves', 0, ['block/birch_leaves'], {opaque: false}, 0, 0, 'any') );
addBlock( new Block('birch_planks', 0, ['block/birch_planks'], {}, 0, 0, 'any') );

addBlock( new Block('spruce_log', 0, ['block/spruce_log_top', 'block/spruce_log'], {}, 0, 0, 'any') );
addBlock( new Block('spruce_leaves', 0, ['block/spruce_leaves'], {opaque: false}, 0, 0, 'any') );
addBlock( new Block('spruce_planks', 0, ['block/spruce_planks'], {}, 0, 0, 'any') );

addBlock( new Block('iron_block', 0, ['block/iron_block'], {}, 0, 0, 'any') );
addBlock( new Block('gold_block', 0, ['block/gold_block'], {}, 0, 0, 'any') );
