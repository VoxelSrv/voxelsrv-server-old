import { players, commands, console } from '../src/api';

export const name = 'Typescript'
export const version = '0.0.1'
export const api = '0.2.0-dev'

function testCommand(executor: any, arg: Array<string>) {
	executor.send('It works!');
}


commands.register('/ts', testCommand, 'Test typescript plugin');