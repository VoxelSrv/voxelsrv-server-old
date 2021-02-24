"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBuilder = exports.validate = exports.sendMlt = exports.convertToPlain = exports.convertFromPlain = exports.ChatComponent = exports.event = void 0;
const events_1 = require("events");
exports.event = new events_1.EventEmitter();
class ChatComponent {
    constructor(text, color = 'white', font = 'lato', linethrough = false, underline = false) {
        this.color = 'white';
        this.linethrough = false;
        this.underline = false;
        this.text = text;
        this.font = font;
        this.color = color;
        this.linethrough = linethrough;
        this.underline = underline;
    }
}
exports.ChatComponent = ChatComponent;
/*
 * Convers plain string to ChatMessage
 */
function convertFromPlain(text) {
    return [new ChatComponent(text)];
}
exports.convertFromPlain = convertFromPlain;
/*
 * Convers ChatMessage to string
 */
function convertToPlain(msg) {
    let plain = '';
    let gameMsg;
    if (msg instanceof MessageBuilder) {
        gameMsg = msg.getGameOutput();
    }
    else {
        gameMsg = msg;
    }
    gameMsg.forEach((x) => {
        plain = plain + x.text;
    });
    return plain;
}
exports.convertToPlain = convertToPlain;
/*
 * Sends ChatMessage to multiple players (and console)
 */
async function sendMlt(readders, msg) {
    exports.event.emit('send-message-mlt', readders, msg);
    readders.forEach((x) => x.send(msg));
}
exports.sendMlt = sendMlt;
/*
 * Validates message
 */
function validate(msg) {
    if (!Array.isArray(msg))
        return false;
    for (let x = 0; x < msg.length; x++) {
        if (typeof msg[x].text != 'string')
            return false;
        if (msg[x].font != undefined && typeof msg[x].font != 'string')
            return false;
        if (msg[x].color != undefined && typeof msg[x].color != 'string')
            return false;
    }
    return true;
}
exports.validate = validate;
/*
 * VoxelServerCore compatible MessageBuilder
 */
class MessageBuilder {
    constructor() {
        this.message = [];
    }
    newLine(text = '') {
        this.message.push({ text: '\n' + text, color: 'white' });
        return this;
    }
    black(text = '') {
        this.message.push({ text: text, color: 'black' });
        return this;
    }
    blue(text = '') {
        this.message.push({ text: text, color: 'blue' });
        return this;
    }
    green(text = '') {
        this.message.push({ text: text, color: 'green' });
        return this;
    }
    cyan(text = '') {
        this.message.push({ text: text, color: 'cyan' });
        return this;
    }
    red(text = '') {
        this.message.push({ text: text, color: 'red' });
        return this;
    }
    purple(text = '') {
        this.message.push({ text: text, color: 'purple' });
        return this;
    }
    orange(text = '') {
        this.message.push({ text: text, color: 'orange' });
        return this;
    }
    grey(text = '') {
        this.message.push({ text: text, color: 'grey' });
        return this;
    }
    lightGrey(text = '') {
        this.message.push({ text: text, color: 'lightgray' });
        return this;
    }
    lightBlue(text = '') {
        this.message.push({ text: text, color: 'lightblue' });
        return this;
    }
    lightGreen(text = '') {
        this.message.push({ text: text, color: 'lightgreen' });
        return this;
    }
    lightCyan(text = '') {
        this.message.push({ text: text, color: 'lightcyan' });
        return this;
    }
    pink(text = '') {
        this.message.push({ text: text, color: 'pink' });
        return this;
    }
    magenta(text = '') {
        this.message.push({ text: text, color: 'magenta' });
        return this;
    }
    yellow(text = '') {
        this.message.push({ text: text, color: 'yellow' });
        return this;
    }
    white(text = '') {
        this.message.push({ text: text, color: 'white' });
        return this;
    }
    linethrough(text = '') {
        this.message[this.message.length - 1].linethrough = true;
        return this;
    }
    underline(text = '') {
        this.message[this.message.length - 1].underline = true;
        return this;
    }
    hex(hex) {
        this.message.push({ text: '', color: hex });
        return this;
    }
    font(font) {
        this.message[this.message.length - 1].text = this.message[this.message.length - 1].font = font;
        return this;
    }
    clear() {
        this.message.push({ text: '', color: 'white' });
        return this;
    }
    text(text) {
        this.message[this.message.length - 1].text = this.message[this.message.length - 1].text + text;
        return this;
    }
    getOutput() {
        return this.message;
    }
    getGameOutput() {
        return this.message;
    }
}
exports.MessageBuilder = MessageBuilder;
//# sourceMappingURL=chat.js.map