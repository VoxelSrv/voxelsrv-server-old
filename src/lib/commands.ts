import { EventEmitter } from 'events';
import * as console from './console';

export const event = new EventEmitter();
export const commands: { [index: string]: Command } = {};

interface Command {
	execute: Function;
	description: string;
}

export function execute(executor: any, args: string) {
	var arg = args.split(' ');
	var command = arg[0];
	arg.shift();
	event.emit(arg[0], { executor: executor, arg: arg });

	var commandList = Object.entries(commands);

	for (var cmd of commandList) {
		if (cmd[0] == command) {
			try {
				commands[command].execute(executor, arg);
			} catch (e) {
				console.error(`User ^R${executor.name}^r tried to execute command ^R${command}^r and it failed! \n ^R`, e);
				executor.send('{color:red}An error occurred during the execution of this command!{color}');
			}
			return;
		}
	}
	executor.send("{color:red}This command doesn't exist! Check /help for list of available commands.{color}");
}

export function register(command: string, func: Function, description: string) {
	commands[command] = { execute: func, description: description };
}
