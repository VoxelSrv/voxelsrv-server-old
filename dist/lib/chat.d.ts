/// <reference types="node" />
import { EventEmitter } from 'events';
export declare const event: EventEmitter;
import { CoreMessage, ICoreMessageBuilder } from 'voxelservercore/interfaces/message';
export interface IChatComponent {
    text: string;
    color?: string;
    font?: string;
    linethrough?: boolean;
    underline?: boolean;
}
export declare type ChatMessage = IChatComponent[];
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
}>, msg: ChatMessage | MessageBuilder | CoreMessage): Promise<void>;
export declare function validate(msg: ChatMessage): boolean;
export declare class MessageBuilder implements ICoreMessageBuilder {
    private message;
    constructor();
    newLine(text?: string): this;
    black(text?: string): this;
    blue(text?: string): this;
    green(text?: string): this;
    cyan(text?: string): this;
    red(text?: string): this;
    purple(text?: string): this;
    orange(text?: string): this;
    grey(text?: string): this;
    lightGrey(text?: string): this;
    lightBlue(text?: string): this;
    lightGreen(text?: string): this;
    lightCyan(text?: string): this;
    pink(text?: string): this;
    magenta(text?: string): this;
    yellow(text?: string): this;
    white(text?: string): this;
    linethrough(text?: string): this;
    underline(text?: string): this;
    hex(hex: string): this;
    font(font: string): this;
    clear(): this;
    text(text: string): this;
    getOutput(): CoreMessage;
    getGameOutput(): ChatMessage;
}
//# sourceMappingURL=chat.d.ts.map