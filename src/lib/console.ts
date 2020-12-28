import { PermissionHolder } from './permissions';
import * as fs from 'fs';

import chalk from 'chalk';

export class Logging {
	logFile: fs.WriteStream;

	constructor(out: fs.WriteStream) {
		this.logFile = out;
	}

	normal(...args: any[]) {
		let out = '';
		let cleanOut = '';
		for (var i = 0; i < arguments.length; i++) {
			const msg = arguments[i];
			out = out + '[' + hourNow() + '] ';
			cleanOut = out;

			if (Array.isArray(msg)) {
				msg.forEach((el) => {
					if (!!el.color && el.color.startsWith('#')) out = out + chalk.hex(el.color)(el.text);
					else if (el.color != undefined) out = out + chalk.keyword(el.color).bold(el.text).toString();
					else out = out + chalk.reset(el.text).toString();
					cleanOut = cleanOut + el.text;
				});
			} else {
				out = out + msg;
				cleanOut = cleanOut + msg;
			}
			console.log(out);

			if (this.logFile != undefined) this.logFile.write(cleanOut + '\n');
		}
	}

	chat(...args: any[]) {
		let out = '';
		let cleanOut = '';

		for (var i = 0; i < arguments.length; i++) {
			out = out + '[' + hourNow() + ' - Chat] ';
			cleanOut = out;

			const msg = arguments[i];
			if (Array.isArray(msg)) {
				msg.forEach((el) => {
					if (!!el.color && el.color.startsWith('#')) out = out + chalk.hex(el.color).bold(el.text).toString();
					else if (el.color != undefined) out = out + chalk.keyword(el.color).bold(el.text).toString();
					else out = out + chalk.yellowBright(el.text);

					cleanOut = cleanOut + el.text;
				});
			} else {
				out = out + chalk.yellowBright(msg).toString();
				cleanOut = cleanOut + msg;
			}
			console.log(out);

			if (this.logFile != undefined) this.logFile.write(cleanOut + '\n');
		}
	}

	warn(...args: any[]) {
		let out = '';
		let cleanOut = '';

		for (var i = 0; i < arguments.length; i++) {
			out = out + '[' + hourNow() + ' - Warn] ';
			cleanOut = out;

			const msg = arguments[i];
			if (Array.isArray(msg)) {
				msg.forEach((el) => {
					if (!!el.color && el.color.startsWith('#')) out = out + chalk.hex(el.color).bold(el.text).toString();
					else if (el.color != undefined) out = out + chalk.keyword(el.color).bold(el.text).toString();
					else out = out + chalk.yellow(el.text).toString();

					cleanOut = cleanOut + el.text;
				});
			} else {
				out = out + chalk.yellow(msg).toString();
				cleanOut = cleanOut + msg;
			}
			console.log(out);

			if (this.logFile != undefined) this.logFile.write(cleanOut + '\n');
		}
	}

	error(...args: any[]) {
		let out = '';
		let cleanOut = '';

		for (var i = 0; i < arguments.length; i++) {
			out = out + '[' + hourNow() + ' - Error] ';
			cleanOut = out;
			const msg = arguments[i];
			if (Array.isArray(msg)) {
				msg.forEach((el) => {
					if (!!el.color && el.color.startsWith('#')) out = out + chalk.hex(el.color).bold(el.text);
					else if (el.color != undefined) out = out + chalk.keyword(el.color).bold(el.text);
					else out = out + chalk.red(el.text);

					cleanOut = cleanOut + el.text;
				});
			} else {
				out = out + chalk.red(msg).toString();
				cleanOut = cleanOut + msg;
			}
			console.log(out);

			if (this.logFile != undefined) this.logFile.write(cleanOut + '\n');
		}
	}

	executor = {
		name: '#console',
		id: '#console',
		send: (...args: any[]) => this.normal(...args),
		permissions: new PermissionHolder({ '*': true }),
	};

	executorchat = { ...this.executor, send: (...args: any[]) => this.chat(...args)};
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
