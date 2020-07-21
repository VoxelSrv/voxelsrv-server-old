const http = require('http').createServer()
const fetch = require('node-fetch')

const fs = require('./src/fs')

var version = '0.1.0'
var protocol = 1

const console = require('./src/console')

console.log('^yStarting VoxelSRV server version ^:' + version + ' ^y[Protocol: ^:' + protocol + '^y]')

try {
	var cfg = require('./config.json')
	console.log('^gLoaded configuration file!')
} catch(e) {
	console.error('Can\'t load config file! \n^R', e.toString())
	console.log('Stopping server')
	return
}

require('./src/blocks').init()
require('./src/items').init()

const plugins = fs.readdirSync('./plugins').filter(file => file.endsWith('.js'))

for (const file of plugins) {
	require('./plugins/' + file)
}


const initProtocol = require('./src/protocol').init

const io = require('socket.io')(http, {
	path: '/',
	serveClient: false,
	// below are engine.IO options
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false
})

if (!fs.existsSync('./plugins') ) fs.mkdirSync('./plugins')
if (!fs.existsSync('./players') ) fs.mkdirSync('./players')
if (!fs.existsSync('./worlds') ) fs.mkdirSync('./worlds')


const worldManager = require('./src/worlds')

if (worldManager.exist('default') == false) worldManager.create('default', cfg.world.seed, cfg.world.generator)
else worldManager.load('default')

initProtocol(io)


if (cfg.public) {
	fetch('http://pb4.eu:9000/update?ip=' + cfg.address + '&motd=' + cfg.motd + '&name=' + cfg.name)
	setInterval(function() {
		fetch('http://pb4.eu:9000/update?ip=' + cfg.address + '&motd=' + cfg.motd + '&name=' + cfg.name)
	}, 30000)
}	
console.log('^yServer started on port: ^:' + cfg.port)

require('./src/commands').register('/stop', (id, args) => {
	if(id != '#console') return

	console.log('^rStopping server...')

	Object.values( require('./src/player').getAll() ).forEach( player => { player.remove() })

	Object.values( worldManager.getAll() ).forEach(world => {
		world.unload()
	})

	setTimeout( () => { process.exit() }, 1000 )

}, 'Stops the server (console only)')

require('./src/console-exec')
http.listen(cfg.port)




