var blocks = {}
var blockIDs = {}


function initBlocks() {
	var _id = 1

	createBlock(_id++, 'stone', 0, ['block/stone'], {}, {drop: 'cobblestone', hardness: 4, tool: 'pickaxe', power: 1})
	createBlock(_id++, 'dirt', 0, ['block/dirt'], {}, {drop: 'dirt', hardness: 2.5, tool: 'shovel'})
	createBlock(_id++, 'grass', 0, ['block/grass_top', 'block/dirt', 'block/grass_side'], {}, {drop: 'dirt', hardness: 2.5, tool: 'shovel'})
	createBlock(_id++, 'grass_snow', 0, ['block/snow', 'block/dirt', 'block/grass_snow'], {}, {drop: 'dirt', hardness: 2.5, tool: 'shovel'})
	createBlock(_id++, 'cobblestone', 0, ['block/cobblestone'], {}, {drop: 'cobblestone', hardness: 5, tool: 'pickaxe', power: 1})
	createBlock(_id++, 'log', 0, ['block/log_top', 'block/log'], {}, {drop: 'log', hardness: 4, tool: 'axe'})
	createBlock(_id++, 'sand', 0, ['block/sand'], {}, {drop: 'sand', hardness: 2.5, tool: 'shovel'})
	createBlock(_id++, 'leaves', 0, ['block/leaves'], {opaque: false}, {drop: 'leaves'})

	createBlock(_id++, 'water', 0, ['block/water'], {material: 'water', fluid: true, fluidDensity: 20.0, viscosity: 20.5 }, {} )

	createBlock(_id++, 'red_flower', 1, ['block/red_flower'], {solid: false, opaque: false}, {drop: 'red_flower'})
	createBlock(_id++, 'grass_plant', 1, ['block/grass_plant'], {solid: false, opaque: false}, {drop: 'grass_plant'})
	createBlock(_id++, 'yellow_flower', 1, ['block/yellow_flower'], {solid: false, opaque: false}, {drop: 'yellow_flower'})
	createBlock(_id++, 'bricks', 0, ['block/bricks'], {}, {drop: 'bricks', hardness: 3, tool: 'pickaxe', power: 1})
	createBlock(_id++, 'planks', 0, ['block/planks'], {}, {drop: 'planks', hardness: 3, tool: 'axe'})
	createBlock(_id++, 'glass', 0, ['block/glass'], {opaque: false}, {drop: 'glass',  hardness: 2, tool: 'pickaxe'})
	createBlock(_id++, 'bookshelf', 0, ['block/planks', 'block/bookshelf'], {}, {drop: 'bookshelf', hardness: 3, tool: 'axe'})

	createBlock(_id++, 'barrier', 0, [], {material: 'barrier'}, {illegal: true, unbreakable: true, tool: 'admin', power: Infinity})

	createBlock(_id++, 'snow', 0, ['block/snow'], {}, {drop: 'snow', hardness: 2, tool: 'shovel'})
	createBlock(_id++, 'coa_ore', 0, ['block/coal_ore'], {}, {drop: 'coal', hardness: 4.5, tool: 'pickaxe', power: 1})
	createBlock(_id++, 'iron_ore', 0, ['block/iron_ore'], {}, {drop: 'iron_ore', hardness: 5.5, tool: 'pickaxe', power: 2})
	createBlock(_id++, 'cactus', 2, ['block/cactus_top', 'block/cactus_side'], {opaque: false}, {drop: 'cactus', hardness: 3, tool: 'axe'})
	createBlock(_id++, 'deadbush', 1, ['block/deadbush'], {solid: false, opaque: false}, {drop: 'deadbush'})
	createBlock(_id++, 'gravel', 0, ['block/gravel'], {}, {drop: 'gravel', hardness: 2.5, tool: 'shovel'})

	createBlock(_id++, 'crafting', 0, ['block/crafting_top', 'block/planks', 'block/crafting_side'], {}, {drop: 'crafting', hardness: 2, tool: 'axe'})

	
	function createBlock(id, name, type, texture, options, data) {
		blockIDs[name] = id 

		blocks[name] = {
			id: id,
			name: name,
			type: type,
			texture: texture,
			options: options,
			data: data
		}
	}
}




module.exports = {
	init() { return initBlocks() },
	get() { return blocks },
	getIDs() { return blockIDs }

}