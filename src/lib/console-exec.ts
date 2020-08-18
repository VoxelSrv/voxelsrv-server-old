import * as console from './console';
import { terminal as term } from 'terminal-kit';
import * as commands from './commands';

let running = true;

const history = [];

const executor = {
	name: '#console',
	send: console.log,
};

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
			commands.execute(executor, '/' + input);
		}
	}
};

x();
