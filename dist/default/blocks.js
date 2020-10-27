"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
const registry_1 = require("../lib/registry");
function setup(registry) {
    registry.addBlock(new registry_1.Block('stone', 0, ['block/stone'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('dirt', 0, ['block/dirt'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('grass', 0, ['block/grass_top', 'block/dirt', 'block/grass_side'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('grass_snow', 0, ['block/snow', 'block/dirt', 'block/grass_snow'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('cobblestone', 0, ['block/cobblestone'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('log', 0, ['block/log_top', 'block/log'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('sand', 0, ['block/sand'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('leaves', 0, ['block/leaves'], { opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('water', 0, ['block/water'], { material: 'water', fluid: true, fluidDensity: 20.0, viscosity: 20.5 }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('red_flower', 1, ['block/red_flower'], { solid: false, opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('grass_plant', 1, ['block/grass_plant'], { solid: false, opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('yellow_flower', 1, ['block/yellow_flower'], { solid: false, opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('bricks', 0, ['block/bricks'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('planks', 0, ['block/planks'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('glass', 0, ['block/glass'], { opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('bookshelf', 0, ['block/planks', 'block/bookshelf'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('barrier', 0, [], { material: 'barrier' }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('snow', 0, ['block/snow'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('coal_ore', 0, ['block/coal_ore'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('iron_ore', 0, ['block/iron_ore'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('cactus', 2, ['block/cactus_top', 'block/cactus_side'], { opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('deadbush', 1, ['block/dead_bush'], { solid: false, opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('gravel', 0, ['block/gravel'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('crafting', 0, ['block/crafting_table_top', 'block/oak_planks', 'block/crafting_table_side'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('stonebrick', 0, ['block/stonebrick'], {}, 0, 0, 'any'));
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
        registry.addBlock(new registry_1.Block(color + '_wool', 0, ['block/' + color + '_wool'], {}, 0, 0, 'any'));
    });
    colors.forEach((color) => {
        registry.addBlock(new registry_1.Block(color + '_stained_glass', 4, ['block/' + color + '_stained_glass'], { opaque: false }, 0, 0, 'any'));
    });
    registry.addBlock(new registry_1.Block('birch_log', 0, ['block/birch_log_top', 'block/birch_log'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('birch_leaves', 0, ['block/birch_leaves'], { opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('birch_planks', 0, ['block/birch_planks'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('spruce_log', 0, ['block/spruce_log_top', 'block/spruce_log'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('spruce_leaves', 0, ['block/spruce_leaves'], { opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('spruce_planks', 0, ['block/spruce_planks'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('iron_block', 0, ['block/iron_block'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('gold_block', 0, ['block/gold_block'], {}, 0, 0, 'any'));
    const bedrock = new registry_1.Block('bedrock', 0, ['block/bedrock'], {}, 0, 0, 'none');
    bedrock.unbreakable = true;
    registry.addBlock(bedrock);
    registry.addBlock(new registry_1.Block('sandstone', 0, ['block/sandstone'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('diamond_ore', 0, ['block/diamond_ore'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('diamond_block', 0, ['block/diamond_block'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('lapis_ore', 0, ['block/lapis_ore'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('lapis_block', 0, ['block/lapis_block'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('mossy_cobblestone', 0, ['block/mossy_cobblestone'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('obsidian', 0, ['block/obsidian'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('mossy_stonebricks', 0, ['block/mossy_stone_bricks'], {}, 0, 0, 'any'));
    colors.forEach((color) => {
        registry.addBlock(new registry_1.Block(color + '_concrete', 0, ['block/' + color + '_concrete'], {}, 0, 0, 'any'));
    });
    registry.addBlock(new registry_1.Block('tnt', 0, ['block/tnt_top', 'block/tnt_bottom', 'block/tnt_side'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('pumpkin', 0, ['block/pumpkin_top', 'block/pumpkin_side', 'block/pumpkin_side'], {}, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('oak_sapling', 1, ['block/oak_sapling'], { solid: false, opaque: false }, 0, 0, 'any'));
    registry.addBlock(new registry_1.Block('ice', 0, ['block/ice'], {}, 0, 0, 'any'));
}
exports.setup = setup;
//# sourceMappingURL=blocks.js.map