import { players, commands, console } from '../src/api';


function testCommand(id: string, arg: Array<string>) {
	if (id == '#console') console.log('It works!');
	else {
		let player = players.get(id);
		player.send('It works!');
	}
}


commands.register('/ts', testCommand, 'Test typescript plugin');