import { register as registerCommand, commands, execute } from '../lib/commands';
import * as console from '../lib/console';
import * as worldManager from '../lib/worlds';
import * as players from '../lib/player';

async function helpCommand(executor, arg) {
	executor.send('**List of all commands:**');
	Object.entries(commands).forEach(function (item) {
		executor.send(item[0] + ' - ' + item[1].description);
	});
}

registerCommand('/help', helpCommand, 'Displays list of all commands');

function stopCommand(executor, args) {
	if (executor.name != '#console') {
		executor.send('{color:red}This command can by only used from console!{color}');
		return;
	}

	console.log('^rStopping server...');

	Object.values(players.getAll()).forEach((player) => {
		player.remove();
	});

	Object.values(worldManager.getAll()).forEach((world) => {
		world.unload();
	});

	setTimeout(() => {
		process.exit();
	}, 1000);
}

registerCommand('/stop', stopCommand, 'Stops the server (console only)');
