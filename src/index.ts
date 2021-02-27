import * as fs from 'fs';
import WebSocket from 'ws';
import https from 'https';
import http from 'http';

import { WSSocket } from './socket';
import { Server } from './server';

export function startServer() {
	let json = '{"port": 3000}';
	if (fs.existsSync('./config/') && fs.existsSync('./config/config.json')) json = fs.readFileSync('./config/config.json').toString();

	let cfg = { port: 3000, useWSS: false, wssOptions: {key: '', cert: ''} };

	try {
		cfg = JSON.parse(json.toString());
	} catch (e) {
		cfg = { port: 3000, useWSS: false, wssOptions: {key: '', cert: ''} };
		fs.unlinkSync('./config/config.json');
	}

	const httpServer: http.Server | https.Server = cfg.useWSS
		? https.createServer({
				cert: fs.readFileSync(cfg.wssOptions.cert),
				key: fs.readFileSync(cfg.wssOptions.key),
		  })
		: http.createServer();

	const wss = new WebSocket.Server({ server: httpServer });
	const server = new Server();

	wss.on('connection', (s, req) => {
		// @ts-ignore
		const ip: string = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		server.connectPlayer(new WSSocket(s, ip));
	});

	server.on('server-stopped', () => {
		process.exit();
	});

	httpServer.listen(cfg.port)

	return server;
}
