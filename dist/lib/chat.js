"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.sendMlt = exports.convertToPlain = exports.convertFromPlain = exports.ChatComponent = exports.event = void 0;
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
    msg.forEach((x) => { plain = plain + x.text; });
    return plain;
}
exports.convertToPlain = convertToPlain;
/*
 * Sends ChatMessage to multiple players (and console)
 */
function sendMlt(readders, msg) {
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
//# sourceMappingURL=chat.js.map