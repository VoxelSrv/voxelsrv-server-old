const fetch = require('node-fetch')
const WebSocket = require('ws')


const fs = require('fs')

var version = '0.2.0'
var protocol = 2

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
require('./src/items').initDefaultItems()

if (!fs.existsSync('./plugins') ) fs.mkdirSync('./plugins')
if (!fs.existsSync('./players') ) fs.mkdirSync('./players')
if (!fs.existsSync('./worlds') ) fs.mkdirSync('./worlds')

const pluginFiles = fs.readdirSync('./plugins').filter(file => file.endsWith('.js') || file.endsWith('.ts'))
const plugins = new Array()

for (const file of pluginFiles) {
	try { plugins.push( require('./plugins/' + file) ) }
	catch(e) { console.error(`Can't load plugin ${file}! Reason: ` + e) }
}


const wss = new WebSocket.Server({ port: cfg.port });


const worldManager = require('./src/worlds')

if (worldManager.exist('default') == false) worldManager.create('default', cfg.world.seed, cfg.world.generator)
else worldManager.load('default')

require('./src/actions').init(wss)
require('./src/player').setIO(wss)
require('./src/protocol-helper').setWS(wss)



if (cfg.public) {
	fetch('http://pb4.eu:9000/update?ip=' + cfg.address + '&motd=' + cfg.motd + '&name=' + cfg.name + 'protocol=' + protocol)
	setInterval(function() {
		fetch('http://pb4.eu:9000/update?ip=' + cfg.address + '&motd=' + cfg.motd + '&name=' + cfg.name  + 'protocol=' + protocol)
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




