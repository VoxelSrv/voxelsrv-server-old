import * as fs from 'fs';
import WebSocket from 'ws';
import { WSSocket } from './socket';
import { Server } from './server';

export function startServer() {
	let json = '{"port": 3000}';
	if (fs.existsSync('./config/') && fs.existsSync('./config/config.json')) json = fs.readFileSync('./config/config.json').toString();

	const cfg = JSON.parse(json.toString());

	const wss = new WebSocket.Server({ port: cfg.port });
	const server = new Server();

	wss.on('connection', (s) => {
		server.connectPlayer(new WSSocket(s));
	});

	server.on('server-stopped', () => {
		process.exit();
	});

	return server;
}
