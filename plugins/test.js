const player = require('../src/player')
const entity = require('../src/entity')
const commands = require('../src/commands')
const chat = require('../src/chat')
const protocol = require('../src/protocol')


function test(id, arg) {
	protocol.send(id, 'sound-play', {sound:'music/bulby/lake.mp3', volume: 1})
}

commands.register('/test', test, '')