const protocol = require('./protocol')
const chat = require('./chat')
const EventEmiter = require('events')
const event = new EventEmiter()

var commands = {}


function executeCommand(id, args) {
	var arg = args.split(' ')
	var command = arg[0]
	arg.shift()
	event.emit(arg[0], {executor: id, arg: arg})

	var commandList = Object.entries(commands)

	for (var cmd of commandList) {
		if (cmd[0] == command) {
			commands[command].execute(id, arg)
		}
	}
}

function registerCommand(command, func, description) {
	commands[command] = {execute: func, desc: description}
}


async function helpCommand(id, arg) {
	chat.send(id, '**List of all commands:**')
	Object.entries(commands).forEach(function(item) {
		chat.send(id, item[0] + ' - ' + item[1].desc)
	})
	
}

registerCommand('/help', helpCommand, 'Displays list of all commands')

module.exports = {
	execute: executeCommand,
	register: registerCommand,
	event: event
}