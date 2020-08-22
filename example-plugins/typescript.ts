import { commands } from '../';

export const name = 'Typescript'
export const version = '0.0.1'
export const supported = '>=0.2.0-alpha'

function testCommand(executor: any, arg: Array<string>) {
	executor.send('It works!');
}


commands.register('/ts', testCommand, 'Test typescript plugin');