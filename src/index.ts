import * as fs from 'fs';
import WebSocket from 'ws';
import { WSSocket } from './socket';
import { Server } from './server';

export function startServer() {
	let json = '{"port": 3000}';
	if (fs.existsSync('./config/') && fs.existsSync('./config/config.json')) json = fs.readFileSync('./config/config.json').toString();

	let cfg = { port: 3000 };

	try {
		cfg = JSON.parse(json.toString());
	} catch (e) {
		cfg = { port: 3000 };
		fs.unlinkSync('./config/config.json');
	}

	const wss = new WebSocket.Server({ port: cfg.port });
	const server = new Server();

	wss.on('connection', (s, req) => {
		// @ts-ignore
		const ip: string = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		server.connectPlayer(new WSSocket(s, ip));
	});

	server.on('server-stopped', () => {
		process.exit();
	});

	return server;
}
