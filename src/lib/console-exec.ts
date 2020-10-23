import * as console from './console';
import { ChatComponent } from './chat';
import { terminal as term } from 'terminal-kit';

export function startCmd(commands) {
	let running = true;

	const history = [];

	const x = async () => {
		let input;
		while (running) {
			input = await term.inputField({
				history: history,
				autoComplete: [],
				autoCompleteMenu: false,
			}).promise;
			if (input != '') {
				term('\n');
				const arg = ('/' + input).split(' ');
				const command = arg[0];
				arg.shift();
				console.event.emit('console-executecommand', console.executor, command, arg);
				history.push(input);

				if (commands[command]) {
					try {
						commands[command].trigger(console.executor, arg);
					} catch (e) {
						console.log([new ChatComponent('An error occurred during the execution of this command!', 'red')]);
					}
				} else console.log([new ChatComponent("This command doesn't exist! Check /help for list of available commands.", 'red')]);
			}
		}
	};

	x();
}
