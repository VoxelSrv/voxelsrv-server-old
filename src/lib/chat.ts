import { EventEmitter } from 'events';
export const event = new EventEmitter();

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
	msg.forEach((x) => {plain = plain + x.text});
	return plain;
}

/*
 * Sends ChatMessage to multiple players (and console)
 */
export function sendMlt(readders: Array<{ send: Function }>, msg: ChatMessage) {
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
