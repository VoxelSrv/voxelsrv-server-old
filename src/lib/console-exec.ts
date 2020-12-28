import { ChatComponent } from './chat';

import * as readline from 'readline';
import type { Server } from '../server';

export function startCmd(server: Server, commands) {
	let running = true;

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const history = [];

	rl.on('SIGINT', () => {
		server.stopServer();
	});

	rl.on('line', (input) => {
		if (server.status != 'active') return;

		history.push(input);

		const arg = ('/' + input).split(' ');
		const command = arg[0];
		arg.shift();

		if (commands[command]) {
			try {
				commands[command].trigger(server.log.executor, arg);
			} catch (e) {
				server.log.error([new ChatComponent('An error occurred during the execution of this command!', 'red')]);
			}
		} else server.log.normal([new ChatComponent("This command doesn't exist! Check /help for list of available commands.", 'red')]);
		rl.prompt();
	});
}
