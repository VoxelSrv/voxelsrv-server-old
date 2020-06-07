const player = require('./player')
const chat = require('./chat')
const world = require('./world/main')
const items = require('./items').get()
const maxStack = require('./items').getStack
const blockIDs = require('./blocks').getIDs()
const blocks = require('./blocks').get()


function executeCommand(id, command) {
	var arg = command.split(' ')
	switch (arg[0]) {
		case '/give':
			player.inv.add(id, arg[1], arg[2], {})
			return 'Gived ' + arg[2] + ' of ' + arg[1]
		case '/giveall':
			Object.keys(items).forEach(function(item) {
				player.inv.add(id, item, maxStack(item), {})
			})
			return 'Gived all items'
	}
}



module.exports = function(id, command) { executeCommand(id, command) }