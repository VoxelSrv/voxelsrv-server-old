const WebSocket = require('ws');
const fs = require('fs');

const json = fs.readFileSync('./config.json');

const cfg = JSON.parse(json.toString());

const wss = new WebSocket.Server({ port: cfg.port });

require('./src/server').startServer(wss, cfg);
