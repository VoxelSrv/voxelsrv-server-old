import { terminal as term } from 'terminal-kit';
import { PermissionHolder } from './permissions';

import { EventEmitter } from 'events';

export const event = new EventEmitter();

export function log(...args: any[]) {
	for (var i = 0; i < arguments.length; i++) {
		term('[' + hourNow() + '] ');
		const msg = arguments[i];
		if (Array.isArray(msg)) {
			msg.forEach((el) => {
				if (!!el.color && el.color.startsWith('#')) term.colorRgbHex(el.color, el.text);
				else if (term[el.color] != undefined) term[el.color](el.text);
				else term(el.text);
			});
		} else term(msg);
		term('\n');
	}
}

export function chat(...args: any[]) {
	for (var i = 0; i < arguments.length; i++) {
		term('[' + hourNow() + ' - ^yChat^:] ');
		const msg = arguments[i];
		if (Array.isArray(msg)) {
			msg.forEach((el) => {
				if (!!el.color && el.color.startsWith('#')) term.colorRgbHex(el.color, el.text);
				else if (term[el.color] != undefined) term[el.color](el.text);
				else term(el.text);
			});
		} else term(msg);
		term('\n');
	}
}

export function warn(...args: any[]) {
	for (var i = 0; i < arguments.length; i++) {
		term('[' + hourNow() + ' - ^RWarning^:] ^R');
		const msg = arguments[i];
		if (Array.isArray(msg)) {
			msg.forEach((el) => {
				if (!!el.color && el.color.startsWith('#')) term.colorRgbHex(el.color, el.text);
				else if (term[el.color] != undefined) term[el.color](el.text);
				else term(el.text);
			});
		} else term(msg);
		term('\n');
	}
}

export function error(...args: any[]) {
	for (var i = 0; i < arguments.length; i++) {
		term('[' + hourNow() + ' - ^rError!^:] ^r');
		const msg = arguments[i];
		if (Array.isArray(msg)) {
			msg.forEach((el) => {
				if (!!el.color && el.color.startsWith('#')) term.colorRgbHex(el.color, el.text);
				else if (term[el.color] != undefined) term[el.color](el.text);
				else term(el.text);
			});
		} else term(msg);
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

export const executor = {
	name: '#console',
	id: '#console',
	send: log,
	permissions: new PermissionHolder({'*': true})
};

export const executorchat = { ...executor, send: chat };

export const obj = console.log;
