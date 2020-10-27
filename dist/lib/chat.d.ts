/// <reference types="node" />
import { EventEmitter } from 'events';
export declare const event: EventEmitter;
export interface IChatComponent {
    text: string;
    color?: string;
    font?: string;
    linethrough?: boolean;
    underline?: boolean;
}
export declare type ChatMessage = Array<IChatComponent>;
export declare class ChatComponent implements IChatComponent {
    text: string;
    font: string;
    color: string;
    linethrough: boolean;
    underline: boolean;
    constructor(text: string, color?: string, font?: string, linethrough?: boolean, underline?: boolean);
}
export declare function convertFromPlain(text: string): ChatComponent[];
export declare function convertToPlain(msg: ChatMessage): string;
export declare function sendMlt(readders: Array<{
    send: Function;
}>, msg: ChatMessage): void;
export declare function validate(msg: ChatMessage): boolean;
//# sourceMappingURL=chat.d.ts.map