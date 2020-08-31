import { register as registerCommand, commands, execute } from '../lib/commands';
import * as console from '../lib/console';
import * as worldManager from '../lib/worlds';
import * as players from '../lib/player';
import * as chat from '../lib/chat';
import * as configs from '../lib/configs';
import * as registry from '../lib/registry';
import { groups } from '../lib/permissions';

const ChatComponent = chat.ChatComponent;

async function helpCommand(executor, arg) {
	executor.send([new ChatComponent('List of all commands:', '#9ed0ff', 'Lato-Bold')]);
	Object.entries(commands).forEach(function (item) {
		executor.send([new ChatComponent(item[0] + ' - ' + item[1].description)]);
	});
}

registerCommand('/help', helpCommand, 'Displays list of all commands');

function teleport(executor, arg) {
	if (executor.id == '#console') return;
	if (!executor.permissions.check('server.teleport')) {
		executor.send([new ChatComponent(`You don't have required permission to use this command!`, 'red')]);
		return;
	}
	if (arg.length == 1) {
		var plID = Object.values(players.getAll());
		for (var x = 0; x < plID.length; x++) {
			if (arg[0].toLowerCase() == plID[x].nickname.toLowerCase()) {
				executor.teleport(plID[x].entity.data.position, plID[x].entity.world);
				executor.send([new ChatComponent('Teleported to player ' + plID[x].nickname, '#63e084')]);
				return;
			}
		}

		executor.send([new ChatComponent('There is nobody online with this nickname', '#ff4040')]);
	} else if (arg.length == 3) {
		executor.teleport([parseFloat(arg[0]), parseFloat(arg[1]), parseFloat(arg[2])], executor.entity.world);
		executor.send([new ChatComponent('Teleported to player ' + JSON.stringify(arg), '#63e084')]);
	} else
		executor.send([
			new ChatComponent('Usage: ', 'orange'),
			new ChatComponent('/tp [playername] ', 'yellow'),
			new ChatComponent('or ', 'orange'),
			new ChatComponent('/tp [x] [y] [z]', 'yellow'),
		]);
}

registerCommand('/tp', teleport, 'Teleports player to other player or location');

function stopCommand(executor, args) {
	if (!executor.permissions.check('server.stop')) {
		executor.send([new ChatComponent(`You don't have required permission to use this command!`, 'red')]);
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

function give(executor, arg) {
	if (executor.id == '#console') return;
	if (!executor.permissions.check('server.give')) {
		executor.send([new ChatComponent(`You don't have required permission to use this command!`, 'red')]);
		return;
	}
	if (registry.itemRegistry[arg[0]] != undefined) {
		var amount = registry.itemRegistry[arg[0]].stack;
		const arg1 = parseInt(arg[1]);
		if (arg1 != undefined && 1 <= arg1 && arg1 <= registry.itemRegistry[arg[0]].stack) amount = Math.round(parseInt(arg[1]));

		executor.inventory.add(arg[0], amount, {});
		executor.send([
			new ChatComponent('Given ', 'green'),
			new ChatComponent(amount.toString(), '#61ff79'),
			new ChatComponent(' of ', 'green'),
			new ChatComponent(arg[0], '#61ff79'),
			new ChatComponent(' to you', 'green'),
		]);
	} else executor.send([new ChatComponent(arg[0] + " isn't defined item on this server!", 'red')]);
}

function giveAll(executor, arg) {
	if (executor.id == '#console') return;
	if (!executor.permissions.check(['server', 'giveall'])) {
		executor.send([new ChatComponent(`You don't have required permission to use this command!`, 'red')]);
		return;
	}
	Object.keys(registry.itemRegistry).forEach(function (item) {
		executor.inventory.add(item, registry.itemRegistry[item].stack, {});
	});
	executor.send([new ChatComponent('Given all items', 'green')]);
}

function clear(executor, arg) {
	if (executor.id == '#console') return;
	if (!executor.permissions.check('server.clear')) {
		executor.send([new ChatComponent(`You don't have required permission to use this command!`, 'red')]);
		return;
	}
	for (let x = 0; x <= executor.inventory.size; x++) {
		executor.inventory.set(x, null, null, null);
	}
	executor.send([new ChatComponent('Your inventory has been cleared', 'green')]);
}

registerCommand('/give', give, 'Gives item to a player');
registerCommand('/giveall', giveAll, 'Gives all items to a player');
registerCommand('/clear', clear, "Clears player's inventory");
