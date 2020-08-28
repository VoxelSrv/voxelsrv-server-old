export interface IChatComponent {
	text: string;
	color?: string;
	font?: string;
	linethrough?: boolean;
	underline?: boolean;
}

export type ChatMessage = Array<IChatComponent>;

export class ChatComponent implements IChatComponent {
	text: string;
	font: string;
	color: string = 'white';
	linethrough: boolean = false;
	underline: boolean = false;

	constructor(text: string, color: string = 'white', font: string = 'lato', linethrough: boolean = false, underline: boolean = false) {
		this.text = text;
		this.font = font;
		this.color = color;
		this.linethrough = linethrough;
		this.underline = underline;
	}
}

export function convertOldFormat(text: string) {
	return [new ChatComponent(text)];
}

export function sendMlt(array: Array<{ send: Function }>, msg: ChatMessage) {
	array.forEach((x) => x.send(msg));
}

export function validate(msg: ChatMessage): boolean {
	if (!Array.isArray(msg)) return false;

	for (let x = 0; x < msg.length; x++) {
		if (typeof msg[x].text != 'string') return false;
		if (msg[x].font != undefined && typeof msg[x].font != 'string') return false;
		if (msg[x].color != undefined && typeof msg[x].color != 'string') return false;
	}

	return true;
}
