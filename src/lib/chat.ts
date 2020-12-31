import { EventEmitter } from 'events';
export const event = new EventEmitter();

import { CoreMessage, ICoreMessageBuilder } from 'voxelservercore/interfaces/message';

export interface IChatComponent {
	text: string;
	color?: string;
	font?: string;
	linethrough?: boolean;
	underline?: boolean;
}

export type ChatMessage = IChatComponent[];

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
export async function sendMlt(readders: Array<{ send: Function }>, msg: ChatMessage | MessageBuilder | CoreMessage) {
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
	private message: CoreMessage & ChatMessage = [];

	constructor() {}

	newLine(text: string = ''): this {
		this.message.push({ text: '\n' + text, color: 'white' });
		return this;
	}
	black(text: string = ''): this {
		this.message.push({ text: text, color: 'black' });
		return this;
	}
	blue(text: string = ''): this {
		this.message.push({ text: text, color: 'blue' });
		return this;
	}
	green(text: string = ''): this {
		this.message.push({ text: text, color: 'green' });
		return this;
	}
	cyan(text: string = ''): this {
		this.message.push({ text: text, color: 'cyan' });
		return this;
	}
	red(text: string = ''): this {
		this.message.push({ text: text, color: 'red' });
		return this;
	}
	purple(text: string = ''): this {
		this.message.push({ text: text, color: 'purple' });
		return this;
	}
	orange(text: string = ''): this {
		this.message.push({ text: text, color: 'orange' });
		return this;
	}
	grey(text: string = ''): this {
		this.message.push({ text: text, color: 'grey' });
		return this;
	}
	lightGrey(text: string = ''): this {
		this.message.push({ text: text, color: 'lightgray' });
		return this;
	}
	lightBlue(text: string = ''): this {
		this.message.push({ text: text, color: 'lightblue' });
		return this;
	}
	lightGreen(text: string = ''): this {
		this.message.push({ text: text, color: 'lightgreen' });
		return this;
	}
	lightCyan(text: string = ''): this {
		this.message.push({ text: text, color: 'lightcyan' });
		return this;
	}
	pink(text: string = ''): this {
		this.message.push({ text: text, color: 'pink' });
		return this;
	}
	magenta(text: string = ''): this {
		this.message.push({ text: text, color: 'magenta' });
		return this;
	}
	yellow(text: string = ''): this {
		this.message.push({ text: text, color: 'yellow' });
		return this;
	}
	white(text: string = ''): this {
		this.message.push({ text: text, color: 'white' });
		return this;
	}
	linethrough(text: string = ''): this {
		this.message[this.message.length - 1].linethrough = true;
		return this;
	}
	underline(text: string = ''): this {
		this.message[this.message.length - 1].underline = true;
		return this;
	}

	hex(hex: string): this {
		this.message.push({ text: '', color: hex });
		return this;
	}

	font(font: string): this {
		this.message[this.message.length - 1].text = this.message[this.message.length - 1].font = font;
		return this;
	}

	clear(): this {
		this.message.push({ text: '', color: 'white' });
		return this;
	}

	text(text: string): this {
		this.message[this.message.length - 1].text = this.message[this.message.length - 1].text + text;
		return this;
	}

	getOutput(): CoreMessage {
		return this.message;
	}

	getGameOutput(): ChatMessage {
		return this.message;
	}
}
