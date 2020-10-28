"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setup = void 0;
const chat_1 = require("../lib/chat");
const registry_1 = require("../lib/registry");
function setup(registry, server) {
    async function helpCommand(executor, arg) {
        executor.send([new chat_1.ChatComponent('List of all commands:', '#9ed0ff', 'Lato-Bold')]);
        Object.values(registry.commands).forEach(function (item) {
            executor.send([new chat_1.ChatComponent(item.command + ' - ' + item.description)]);
        });
    }
    registry.addCommand(new registry_1.Command('/help', helpCommand, 'Displays list of all commands'));
    function teleport(executor, arg) {
        if (executor.id == '#console')
            return;
        if (!executor.permissions.check('server.teleport')) {
            executor.send([new chat_1.ChatComponent(`You don't have required permission to use this command!`, 'red')]);
            return;
        }
        if (arg.length == 1) {
            var plID = Object.values(server.players.getAll());
            for (var x = 0; x < plID.length; x++) {
                if (arg[0].toLowerCase() == plID[x].nickname.toLowerCase()) {
                    executor.teleport(plID[x].entity.data.position, plID[x].entity.world.name);
                    executor.send([new chat_1.ChatComponent('Teleported to player ' + plID[x].nickname, '#63e084')]);
                    return;
                }
            }
            executor.send([new chat_1.ChatComponent('There is nobody online with this nickname', '#ff4040')]);
        }
        else if (arg.length == 3) {
            executor.teleport([parseFloat(arg[0]), parseFloat(arg[1]), parseFloat(arg[2])], executor.entity.world.name);
            executor.send([new chat_1.ChatComponent('Teleported to player ' + JSON.stringify(arg), '#63e084')]);
        }
        else
            executor.send([
                new chat_1.ChatComponent('Usage: ', 'orange'),
                new chat_1.ChatComponent('/tp [playername] ', 'yellow'),
                new chat_1.ChatComponent('or ', 'orange'),
                new chat_1.ChatComponent('/tp [x] [y] [z]', 'yellow'),
            ]);
    }
    registry.addCommand(new registry_1.Command('/tp', teleport, 'Teleports player to other player or location'));
    function stopCommand(executor, args) {
        if (!executor.permissions.check('server.stop')) {
            executor.send([new chat_1.ChatComponent(`You don't have required permission to use this command!`, 'red')]);
            return;
        }
        server.stopServer();
    }
    registry.addCommand(new registry_1.Command('/stop', stopCommand, 'Stops the server (console only)'));
    function give(executor, arg) {
        if (executor.id == '#console')
            return;
        if (!executor.permissions.check('server.give')) {
            executor.send([new chat_1.ChatComponent(`You don't have required permission to use this command!`, 'red')]);
            return;
        }
        if (registry.items[arg[0]] != undefined) {
            var amount = registry.items[arg[0]].stack;
            const arg1 = parseInt(arg[1]);
            if (arg1 != undefined && 1 <= arg1 && arg1 <= registry.items[arg[0]].stack)
                amount = Math.round(parseInt(arg[1]));
            executor.inventory.add(arg[0], amount, {});
            executor.send([
                new chat_1.ChatComponent('Given ', 'green'),
                new chat_1.ChatComponent(amount.toString(), '#61ff79'),
                new chat_1.ChatComponent(' of ', 'green'),
                new chat_1.ChatComponent(arg[0], '#61ff79'),
                new chat_1.ChatComponent(' to you', 'green'),
            ]);
        }
        else
            executor.send([new chat_1.ChatComponent(arg[0] + " isn't defined item on this server!", 'red')]);
    }
    function giveAll(executor, arg) {
        if (executor.id == '#console')
            return;
        if (!executor.permissions.check('server.giveall')) {
            executor.send([new chat_1.ChatComponent(`You don't have required permission to use this command!`, 'red')]);
            return;
        }
        Object.keys(registry.items).forEach(function (item) {
            executor.inventory.add(item, registry.items[item].stack, {});
        });
        executor.send([new chat_1.ChatComponent('Given all items', 'green')]);
    }
    function clear(executor, arg) {
        if (executor.id == '#console')
            return;
        if (!executor.permissions.check('server.clear')) {
            executor.send([new chat_1.ChatComponent(`You don't have required permission to use this command!`, 'red')]);
            return;
        }
        for (let x = 0; x <= executor.inventory.size; x++) {
            executor.inventory.set(x, null, null, null);
        }
        executor.send([new chat_1.ChatComponent('Your inventory has been cleared', 'green')]);
    }
    registry.addCommand(new registry_1.Command('/give', give, 'Gives item to a player'));
    registry.addCommand(new registry_1.Command('/giveall', giveAll, 'Gives all items to a player'));
    registry.addCommand(new registry_1.Command('/clear', clear, "Clears player's inventory"));
}
exports.setup = setup;
//# sourceMappingURL=commands.js.map