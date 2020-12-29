/// <reference types="node" />
import { EventEmitter } from 'events';
export declare const event: EventEmitter;
import { ICoreMessageBuilder } from 'voxelservercore/interfaces/message';
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
}>, msg: ChatMessage): Promise<void>;
export declare function validate(msg: ChatMessage): boolean;
export declare class MessageBuilder implements ICoreMessageBuilder {
    message: ChatMessage;
    constructor();
    newLine(): this;
    black(): this;
    blue(): this;
    green(): this;
    cyan(): this;
    red(): this;
    purple(): this;
    orange(): this;
    grey(): this;
    lightGrey(): this;
    lightBlue(): this;
    lightGreen(): this;
    lightCyan(): this;
    pink(): this;
    magenta(): this;
    yellow(): this;
    white(): this;
    linethrough(): this;
    underline(): this;
    hex(hex: string): this;
    clear(): this;
    text(text: string): this;
    getOutput(): ChatMessage;
}
//# sourceMappingURL=chat.d.ts.map