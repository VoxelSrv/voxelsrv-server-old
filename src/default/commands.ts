import { register as registerCommand, commands, execute } from '../lib/commands';
import * as console from '../lib/console';
import * as worldManager from '../lib/worlds';
import * as players from '../lib/player';
import * as chat from '../lib/chat';

async function helpCommand(executor, arg) {
	executor.send([new chat.ChatComponent('List of all commands:', '#9ed0ff', 'Lato-Bold')]);
	Object.entries(commands).forEach(function (item) {
		executor.send([new chat.ChatComponent(item[0] + ' - ' + item[1].description)]);
	});
}

registerCommand('/help', helpCommand, 'Displays list of all commands');

function stopCommand(executor, args) {
	if (executor.name != '#console') {
		executor.send([new chat.ChatComponent('This command can by only used from console!', 'red')]);
		return;
	}

	console.log('^rStopping server...');

	Object.values(players.getAll()).forEach((player) => {
		player.kick('Server close')
	});

	Object.values(worldManager.getAll()).forEach((world) => {
		world.unload();
	});

	setTimeout(() => {
		process.exit();
	}, 1000);
}

registerCommand('/stop', stopCommand, 'Stops the server (console only)');
