const WebSocket = require('ws')
const fs = require('fs')

/*const pluginFiles = fs.readdirSync('./plugins').filter(file => file.endsWith('.js') || file.endsWith('.ts'))
const plugins = new Array()

for (const file of pluginFiles) {
	try { plugins.push( require('./plugins/' + file) ) }
	catch(e) { console.error(`Can't load plugin ${file}! Reason: ` + e) }
}*/

const json = fs.readFileSync('./config.json')

const cfg = JSON.parse(json.toString())

const wss = new WebSocket.Server({ port: cfg.port });

require('./src/server').startServer(wss, cfg)










