const player = require('../src/player')
const entity = require('../src/entity')
const commands = require('../src/commands')
const chat = require('../src/chat')


function test(id, arg) {
	entity.create({
		name: 'Test',
		type: 'player',
		health: 20,
		maxhealth: 20,
		model: 'player',
		texture: 'entity/steve',
		position: [-4, 21, 0],
		rotation: 0
	})
}

commands.register('/test', test, '')