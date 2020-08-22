import { terminal as term } from 'terminal-kit';

export function log(...args: any[]) {
	for (var i = 0; i < arguments.length; i++) {
		term('[' + hourNow() + '] ' + arguments[i]);
		term('\n');
	}
}

export function chat(...args: any[]) {
	for (var i = 0; i < arguments.length; i++) {
		term('[' + hourNow() + ' - ^yChat^:] ' + arguments[i]);
		term('\n');
	}
}

export function warn(...args: any[]) {
	for (var i = 0; i < arguments.length; i++) {
		term('[' + hourNow() + ' - ^RWarning^:] ^R' + arguments[i]);
		term('\n');
	}
}

export function error(...args: any[]) {
	for (var i = 0; i < arguments.length; i++) {
		term('[' + hourNow() + ' - ^rError!^:] ^r' + arguments[i]);
		term('\n');
	}
}

function hourNow(): string {
	var date = new Date();
	var hour = date.getHours().toString();
	var minutes = date.getMinutes().toString();
	var seconds = date.getSeconds().toString();

	return (
		(hour.length == 2 ? hour : '0' + hour) +
		':' +
		(minutes.length == 2 ? minutes : '0' + minutes) +
		':' +
		(seconds.length == 2 ? seconds : '0' + seconds)
	);
}

export const obj = console.log;
