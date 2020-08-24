
export interface IChatComponent {
	text: string;
	color?: string;
	font?: string;
}

export type ChatMessage = Array<IChatComponent>;

export class ChatComponent implements IChatComponent {
	text: string;
	font: string;
	color: string = 'white';
	constructor(text: string, font: string = 'lato', color: string = 'white') {
		this.text = text;
		this.font = font;
		this.color = color;
	}
}


export function convertOldFormat(text: string) {
	return [new ChatComponent(text)]
}