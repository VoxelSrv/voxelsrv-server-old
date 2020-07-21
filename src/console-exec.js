const console = require('./console')
const term = require('terminal-kit').terminal
const commands = require('./commands')
const running = true

var history = []

var input = null

const x = async() => {
    var input
    while (running) {
        input = await term.inputField({ history: history, autoComplete: [] , autoCompleteMenu: false }).promise
        term('\n')
        commands.execute('#console', '/' + input)
    }
}

x()
