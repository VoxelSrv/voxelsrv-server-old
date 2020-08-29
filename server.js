const WebSocket = require('ws');
const fs = require('fs');

let json = '{"port": 3000}'
if (fs.existsSync('./config/') && fs.existsSync('./config/config.json')) json = fs.readFileSync('./config/config.json');

const cfg = JSON.parse(json.toString());

const wss = new WebSocket.Server({ port: cfg.port });

require('./src/server').startServer(wss);
