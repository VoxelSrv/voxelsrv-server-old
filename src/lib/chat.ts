import { EventEmitter } from 'events';
export const event = new EventEmitter();

import { ICoreMessageBuilder } from 'voxelservercore/interfaces/message';

export interface IChatComponent {
	text: string;
	color?: string;
	font?: string;
	linethrough?: boolean;
	underline?: boolean;
}

export type ChatMessage = Array<IChatComponent>;

export class ChatComponent implements IChatComponent {
	public text: string;
	public font: string;
	public color: string = 'white';
	public linethrough: boolean = false;
	public underline: boolean = false;

	constructor(text: string, color: string = 'white', font: string = 'lato', linethrough: boolean = false, underline: boolean = false) {
		this.text = text;
		this.font = font;
		this.color = color;
		this.linethrough = linethrough;
		this.underline = underline;
	}
}

/*
 * Convers plain string to ChatMessage
 */
export function convertFromPlain(text: string) {
	return [new ChatComponent(text)];
}

/*
 * Convers ChatMessage to string
 */
export function convertToPlain(msg: ChatMessage) {
	let plain = '';
	msg.forEach((x) => {
		plain = plain + x.text;
	});
	return plain;
}

/*
 * Sends ChatMessage to multiple players (and console)
 */
export async function sendMlt(readders: Array<{ send: Function }>, msg: ChatMessage) {
	event.emit('send-message-mlt', readders, msg);
	readders.forEach((x) => x.send(msg));
}

/*
 * Validates message
 */
export function validate(msg: ChatMessage): boolean {
	if (!Array.isArray(msg)) return false;

	for (let x = 0; x < msg.length; x++) {
		if (typeof msg[x].text != 'string') return false;
		if (msg[x].font != undefined && typeof msg[x].font != 'string') return false;
		if (msg[x].color != undefined && typeof msg[x].color != 'string') return false;
	}

	return true;
}

/*
 * VoxelServerCore compatible MessageBuilder
 */

export class MessageBuilder implements ICoreMessageBuilder {
	message: ChatMessage = [];

	constructor() {}

	newLine(): this {
		this.message.push({ text: '\n', color: 'white' });
		return this;
	}
	black(): this {
		this.message.push({ text: '', color: 'black' });
		return this;
	}
	blue(): this {
		this.message.push({ text: '', color: 'blue' });
		return this;
	}
	green(): this {
		this.message.push({ text: '', color: 'green' });
		return this;
	}
	cyan(): this {
		this.message.push({ text: '', color: 'cyan' });
		return this;
	}
	red(): this {
		this.message.push({ text: '', color: 'red' });
		return this;
	}
	purple(): this {
		this.message.push({ text: '', color: 'purple' });
		return this;
	}
	orange(): this {
		this.message.push({ text: '', color: 'orange' });
		return this;
	}
	grey(): this {
		this.message.push({ text: '', color: 'grey' });
		return this;
	}
	lightGrey(): this {
		this.message.push({ text: '', color: 'lightgray' });
		return this;
	}
	lightBlue(): this {
		this.message.push({ text: '', color: 'lightblue' });
		return this;
	}
	lightGreen(): this {
		this.message.push({ text: '', color: 'lightgreen' });
		return this;
	}
	lightCyan(): this {
		this.message.push({ text: '', color: 'lightcyan' });
		return this;
	}
	pink(): this {
		this.message.push({ text: '', color: 'pink' });
		return this;
	}
	magenta(): this {
		this.message.push({ text: '', color: 'magenta' });
		return this;
	}
	yellow(): this {
		this.message.push({ text: '', color: 'yellow' });
		return this;
	}
	white(): this {
		this.message.push({ text: '', color: 'white' });
		return this;
	}
	linethrough(): this {
		this.message[this.message.length - 1].linethrough = true;
		return this;
	}
	underline(): this {
		this.message[this.message.length - 1].underline = true;
		return this;
	}
	hex(hex: string): this {
		this.message.push({ text: '', color: hex });
		return this;
	}

	clear(): this {
		this.message.push({ text: '' });
		return this;
	}

	text(text: string): this {
		this.message[this.message.length - 1].text = this.message[this.message.length - 1].text + text;
		return this;
	}

	getOutput() {
		return this.message;
	}
}
