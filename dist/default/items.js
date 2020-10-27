"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
const registry_1 = require("../lib/registry");
function setup(registry) {
    registry.addItem(new registry_1.ItemBlock('stone', 'Stone', 'block/stone', 64, 'stone', false));
    registry.addItem(new registry_1.ItemBlock('dirt', 'Dirt', 'block/dirt', 64, 'dirt', false));
    registry.addItem(new registry_1.ItemBlock('grass', 'Grass block', 'block/grass_side', 64, 'grass', false));
    registry.addItem(new registry_1.ItemBlock('grass_snow', 'Snowy grass block', 'block/grass_snow', 64, 'grass_snow', false));
    registry.addItem(new registry_1.ItemBlock('cobblestone', 'Cobblestone', 'block/cobblestone', 64, 'cobblestone', false));
    registry.addItem(new registry_1.ItemBlock('log', 'Log', 'block/log', 64, 'log', false));
    registry.addItem(new registry_1.ItemBlock('sand', 'Sand', 'block/sand', 64, 'sand', false));
    registry.addItem(new registry_1.ItemBlock('leaves', 'Leaves', 'block/leaves', 64, 'leaves', false));
    registry.addItem(new registry_1.ItemBlock('red_flower', 'Poppy', 'block/red_flower', 64, 'red_flower', true));
    registry.addItem(new registry_1.ItemBlock('grass_plant', 'Grass', 'block/grass_plant', 64, 'grass_plant', true));
    registry.addItem(new registry_1.ItemBlock('yellow_flower', 'Dandelion', 'block/yellow_flower', 64, 'yellow_flower', true));
    registry.addItem(new registry_1.ItemBlock('deadbush', 'Dead bush', 'block/dead_bush', 64, 'deadbush', true));
    registry.addItem(new registry_1.ItemBlock('bricks', 'Bricks', 'block/bricks', 64, 'bricks', false));
    registry.addItem(new registry_1.ItemBlock('planks', 'Planks', 'block/planks', 64, 'planks', false));
    registry.addItem(new registry_1.ItemBlock('glass', 'Glass', 'block/glass', 64, 'glass', false));
    registry.addItem(new registry_1.ItemBlock('bookshelf', 'Bookshelf', 'block/bookshelf', 64, 'bookshelf', false));
    registry.addItem(new registry_1.ItemBlock('snow', 'Snow block', 'block/snow', 64, 'snow', false));
    registry.addItem(new registry_1.ItemBlock('coal_ore', 'Coal ore', 'block/coal_ore', 64, 'coal_ore', false));
    registry.addItem(new registry_1.ItemBlock('iron_ore', 'Iron ore', 'block/iron_ore', 64, 'iron_ore', false));
    registry.addItem(new registry_1.ItemBlock('cactus', 'Cactus', 'block/cactus_side', 64, 'cactus', false));
    registry.addItem(new registry_1.ItemBlock('stonebrick', 'Stone brick', 'block/stonebrick', 64, 'stonebrick', false));
    const colors = [
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
    colors.forEach(function (color) {
        const name = color.charAt(0).toUpperCase() + color.slice(1);
        registry.addItem(new registry_1.ItemBlock(color + '_wool', name + ' wool', 'block/' + color + '_wool', 64, color + '_wool', false));
    });
    colors.forEach(function (color) {
        const name = color.charAt(0).toUpperCase() + color.slice(1);
        registry.addItem(new registry_1.ItemBlock(color + '_stained_glass', name + ' stained glass', 'block/' + color + '_stained_glass', 64, color + '_stained_glass', false));
    });
    registry.addItem(new registry_1.ItemBlock('birch_leaves', 'Birch leaves', 'block/birch_leaves', 64, 'birch_leaves', false));
    registry.addItem(new registry_1.ItemBlock('birch_log', 'Birch log', 'block/birch_log', 64, 'birch_log', false));
    registry.addItem(new registry_1.ItemBlock('birch_planks', 'Birch planks', 'block/birch_planks', 64, 'birch_planks', false));
    registry.addItem(new registry_1.ItemBlock('spruce_leaves', 'Spruce leaves', 'block/spruce_leaves', 64, 'spruce_leaves', false));
    registry.addItem(new registry_1.ItemBlock('spruce_log', 'Spruce log', 'block/spruce_log', 64, 'spruce_log', false));
    registry.addItem(new registry_1.ItemBlock('spruce_planks', 'Spruce planks', 'block/spruce_planks', 64, 'spruce_planks', false));
    registry.addItem(new registry_1.ItemBlock('iron_block', 'Iron block', 'block/iron_block', 64, 'iron_block', false));
    registry.addItem(new registry_1.ItemBlock('gold_block', 'Gold block', 'block/gold_block', 64, 'gold_block', false));
    registry.addItem(new registry_1.ItemBlock('crafting', 'Crafting table', 'block/crafting_table_side', 64, 'crafting', false));
    registry.addItem(new registry_1.ItemBlock('sandstone', 'Sandstone', 'block/sandstone', 64, 'sandstone', false));
    registry.addItem(new registry_1.ItemBlock('diamond_ore', 'Diamond ore', 'block/diamond_ore', 64, 'diamond_ore', false));
    registry.addItem(new registry_1.ItemBlock('diamond_block', 'Diamond ore', 'block/diamond_block', 64, 'diamond_block', false));
    registry.addItem(new registry_1.ItemBlock('lapis_ore', 'Lapis ore', 'block/lapis_ore', 64, 'lapis_ore', false));
    registry.addItem(new registry_1.ItemBlock('lapis_block', 'Lapis ore', 'block/lapis_block', 64, 'lapis_block', false));
    registry.addItem(new registry_1.ItemBlock('mossy_cobblestone', 'Mossy cobblestone', 'block/mossy_cobblestone', 64, 'mossy_cobblestone', false));
    registry.addItem(new registry_1.ItemBlock('mossy_stonebricks', 'Mossy stonebricks', 'block/mossy_stone_bricks', 64, 'mossy_stonebricks', false));
    registry.addItem(new registry_1.ItemBlock('obsidian', 'Obsidian', 'block/obsidian', 64, 'obsidian', false));
    colors.forEach(function (color) {
        const name = color.charAt(0).toUpperCase() + color.slice(1);
        registry.addItem(new registry_1.ItemBlock(color + '_concrete', name + ' concrete', 'block/' + color + '_concrete', 64, color + '_concrete', false));
    });
    registry.addItem(new registry_1.ItemBlock('tnt', 'TNT', 'block/tnt_side', 64, 'tnt', false));
    registry.addItem(new registry_1.ItemBlock('pumpkin', 'Pumpkin', 'block/pumpkin_side', 64, 'pumpkin', false));
    registry.addItem(new registry_1.ItemBlock('water_bucket', 'Water bucket', 'item/water_bucket', 1, 'water', false));
    registry.addItem(new registry_1.ItemBlock('bucket', 'Bucket', 'item/bucket', 1, 'air', false));
}
exports.setup = setup;
//# sourceMappingURL=items.js.map