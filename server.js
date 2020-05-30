var version = '0.1.0'
var protocol = 1

console.log('Starting VoxelSRV server version ' + version + '(protocol:' + protocol + ')')

try {
	var cfg = require('./config.json')
	console.log('Loaded configuration file! \n', cfg)
} catch(e) {
	console.error('Can\'t load config file! \n', e)
	console.error('\nStopping server')
	return
}

require('./src/blocks').init()

const http = require('http').createServer();
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

initProtocol(io)

console.log('Server started on port: ' + cfg.port)
http.listen(cfg.port)



