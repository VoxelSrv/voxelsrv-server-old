import * as console from '../lib/console';
import { ChatComponent, ChatMessage } from '../lib/chat';
import * as configs from '../lib/configs';
import { Registry, Command } from '../lib/registry';
import type { Server } from '../server';

export function setup(registry: Registry, server: Server) {
	async function helpCommand(executor, arg) {
		executor.send([new ChatComponent('List of all commands:', '#9ed0ff', 'Lato-Bold')]);
		Object.values(registry.commands).forEach(function (item) {
			executor.send([new ChatComponent(item.command + ' - ' + item.description)]);
		});
	}

	registry.addCommand(new Command('/help', helpCommand, 'Displays list of all commands'));

	function teleport(executor, arg) {
		if (executor.id == '#console') return;
		if (!executor.permissions.check('server.teleport')) {
			executor.send([new ChatComponent(`You don't have required permission to use this command!`, 'red')]);
			return;
		}
		if (arg.length == 1) {
			var plID = Object.values(server.players.getAll());
			for (var x = 0; x < plID.length; x++) {
				if (arg[0].toLowerCase() == plID[x].nickname.toLowerCase()) {
					executor.teleport(plID[x].entity.data.position, plID[x].entity.world.name);
					executor.send([new ChatComponent('Teleported to player ' + plID[x].nickname, '#63e084')]);
					return;
				}
			}

			executor.send([new ChatComponent('There is nobody online with this nickname', '#ff4040')]);
		} else if (arg.length == 3) {
			executor.teleport([parseFloat(arg[0]), parseFloat(arg[1]), parseFloat(arg[2])], executor.entity.world.name);
			executor.send([new ChatComponent('Teleported to player ' + JSON.stringify(arg), '#63e084')]);
		} else
			executor.send([
				new ChatComponent('Usage: ', 'orange'),
				new ChatComponent('/tp [playername] ', 'yellow'),
				new ChatComponent('or ', 'orange'),
				new ChatComponent('/tp [x] [y] [z]', 'yellow'),
			]);
	}

	registry.addCommand(new Command('/tp', teleport, 'Teleports player to other player or location'));

	function stopCommand(executor, args) {
		if (!executor.permissions.check('server.stop')) {
			executor.send([new ChatComponent(`You don't have required permission to use this command!`, 'red')]);
			return;
		}

		server.stopServer();
	}

	registry.addCommand(new Command('/stop', stopCommand, 'Stops the server (console only)'));

	function give(executor, arg) {
		if (executor.id == '#console') return;
		if (!executor.permissions.check('server.give')) {
			executor.send([new ChatComponent(`You don't have required permission to use this command!`, 'red')]);
			return;
		}
		if (registry.items[arg[0]] != undefined) {
			var amount = registry.items[arg[0]].stack;
			const arg1 = parseInt(arg[1]);
			if (arg1 != undefined && 1 <= arg1 && arg1 <= registry.items[arg[0]].stack) amount = Math.round(parseInt(arg[1]));

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
		if (!executor.permissions.check('server.giveall')) {
			executor.send([new ChatComponent(`You don't have required permission to use this command!`, 'red')]);
			return;
		}
		Object.keys(registry.items).forEach(function (item) {
			executor.inventory.add(item, registry.items[item].stack, {});
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

	registry.addCommand(new Command('/give', give, 'Gives item to a player'));
	registry.addCommand(new Command('/giveall', giveAll, 'Gives all items to a player'));
	registry.addCommand(new Command('/clear', clear, "Clears player's inventory"));
}
