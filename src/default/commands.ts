import { register as registerCommand, commands, execute } from '../lib/commands';
import * as console from '../lib/console';
import * as worldManager from '../lib/worlds';
import * as players from '../lib/player';
import * as chat from '../lib/chat';
import * as configs from '../lib/configs';
import { groups } from '../lib/permissions';

async function helpCommand(executor, arg) {
	executor.send([new chat.ChatComponent('List of all commands:', '#9ed0ff', 'Lato-Bold')]);
	Object.entries(commands).forEach(function (item) {
		executor.send([new chat.ChatComponent(item[0] + ' - ' + item[1].description)]);
	});
}

registerCommand('/help', helpCommand, 'Displays list of all commands');

function stopCommand(executor, args) {
	if (!executor.permissions.check('server.stop')) {
		executor.send([new chat.ChatComponent(`You don't have required permission to use this command!`, 'red')]);
		return;
	}

	console.log('^rStopping server...');
	configs.save('', 'permissions', groups);

	Object.values(players.getAll()).forEach((player) => {
		player.kick('Server close');
	});

	Object.values(worldManager.getAll()).forEach((world) => {
		world.unload();
	});

	setTimeout(() => {
		process.exit();
	}, 1000);
}

registerCommand('/stop', stopCommand, 'Stops the server (console only)');
