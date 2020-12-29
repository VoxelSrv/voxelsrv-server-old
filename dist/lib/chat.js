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
    msg.forEach((x) => {
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
    newLine() {
        this.message.push({ text: '\n', color: 'white' });
        return this;
    }
    black() {
        this.message.push({ text: '', color: 'black' });
        return this;
    }
    blue() {
        this.message.push({ text: '', color: 'blue' });
        return this;
    }
    green() {
        this.message.push({ text: '', color: 'green' });
        return this;
    }
    cyan() {
        this.message.push({ text: '', color: 'cyan' });
        return this;
    }
    red() {
        this.message.push({ text: '', color: 'red' });
        return this;
    }
    purple() {
        this.message.push({ text: '', color: 'purple' });
        return this;
    }
    orange() {
        this.message.push({ text: '', color: 'orange' });
        return this;
    }
    grey() {
        this.message.push({ text: '', color: 'grey' });
        return this;
    }
    lightGrey() {
        this.message.push({ text: '', color: 'lightgray' });
        return this;
    }
    lightBlue() {
        this.message.push({ text: '', color: 'lightblue' });
        return this;
    }
    lightGreen() {
        this.message.push({ text: '', color: 'lightgreen' });
        return this;
    }
    lightCyan() {
        this.message.push({ text: '', color: 'lightcyan' });
        return this;
    }
    pink() {
        this.message.push({ text: '', color: 'pink' });
        return this;
    }
    magenta() {
        this.message.push({ text: '', color: 'magenta' });
        return this;
    }
    yellow() {
        this.message.push({ text: '', color: 'yellow' });
        return this;
    }
    white() {
        this.message.push({ text: '', color: 'white' });
        return this;
    }
    linethrough() {
        this.message[this.message.length - 1].linethrough = true;
        return this;
    }
    underline() {
        this.message[this.message.length - 1].underline = true;
        return this;
    }
    hex(hex) {
        this.message.push({ text: '', color: hex });
        return this;
    }
    clear() {
        this.message.push({ text: '' });
        return this;
    }
    text(text) {
        this.message[this.message.length - 1].text = this.message[this.message.length - 1].text + text;
        return this;
    }
    getOutput() {
        return this.message;
    }
}
exports.MessageBuilder = MessageBuilder;
//# sourceMappingURL=chat.js.map