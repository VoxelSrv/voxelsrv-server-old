var version = '0.1.0'
var protocol = 1

console.log('Starting VoxelSRV server version ' + version + ' [Protocol: ' + protocol + ']\n')

try {
	var cfg = require('./config.json')
	console.log('Loaded configuration file! \n', cfg), '\n'
} catch(e) {
	console.error('Can\'t load config file! \n', e)
	console.error('\nStopping server')
	return
}

require('./src/blocks').init()
require('./src/items').init()

const fs = require('fs')
const http = require('http').createServer()
const fetch = require('node-fetch')
const initProtocol = require('./src/protocol').init
const { verify } = require('crypto')

const io = require('socket.io')(http, {
	path: '/',
	serveClient: false,
	// below are engine.IO options
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false
})

require('./src/world/main').init(cfg.world.seed)

initProtocol(io)

const plugins = fs.readdirSync('./plugins').filter(file => file.endsWith('.js'))

for (const file of plugins) {
	require('./plugins/' + file)
}

if (cfg.public) {
	fetch('http://pb4.eu:9000/update?ip=' + cfg.address + '&motd=' + cfg.motd + '&name=' + cfg.name)
	setInterval(function() {
		fetch('http://pb4.eu:9000/update?ip=' + cfg.address + '&motd=' + cfg.motd + '&name=' + cfg.name)
	}, 30000)
}	
console.log('Server started on port: ' + cfg.port)
http.listen(cfg.port)




