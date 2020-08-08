try {
	var term = require('terminal-kit').terminal
} catch(e) {
	var term = (text) => { console.log('Server: ' + text) }
}

var history = []

function log() {
    for (var i = 0; i < arguments.length; i++) {
        term('[' + hourNow() + '] ' + arguments[i])
    }
    term('\n')
}

function chat() {
    for (var i = 0; i < arguments.length; i++) {
        term('[' + hourNow() + ' - ^yChat^:] ' + arguments[i])
    }
    term('\n')
}

function error() {
    for (var i = 0; i < arguments.length; i++) {
        term('[' + hourNow() + ' - ^rError!^:] ^r' + arguments[i])
    }
    term('\n')
}


function hourNow() {
    var date = new Date()
    var hour = date.getHours().toString()
    var minutes = date.getMinutes().toString()
    var seconds = date.getSeconds().toString()

    return ( (hour.length == 2) ? hour : '0' + hour ) + ':' + ( (minutes.length == 2) ? minutes : '0' + minutes ) + ':' + ( (seconds.length == 2) ? seconds : '0' + seconds )
}



module.exports = {
    log: log,
    chat: chat,
	error: error,
	obj: console.log
}