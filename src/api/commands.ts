import { Command, addCommand } from '../lib/registry';
import { event as playerEvent } from '../lib/player';
import { event as consoleEvent } from '../lib/console';

import { EventEmitter } from 'events';

export const event = new EventEmitter();

export function register(cmd: string, func: Function, desc: string = 'Custom command') {
	addCommand(new Command(cmd, func, desc));
}

playerEvent.on('player-executecommand', (player, command, args) => {
	event.emit(command, player, args);
});

consoleEvent.on('console-executecommand', (player, command, args) => {
	event.emit(command, player, args);
});
