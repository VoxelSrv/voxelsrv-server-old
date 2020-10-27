"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obj = exports.executorchat = exports.executor = exports.error = exports.warn = exports.chat = exports.log = exports.event = void 0;
const terminal_kit_1 = require("terminal-kit");
const permissions_1 = require("./permissions");
const events_1 = require("events");
exports.event = new events_1.EventEmitter();
function log(...args) {
    for (var i = 0; i < arguments.length; i++) {
        terminal_kit_1.terminal('[' + hourNow() + '] ');
        const msg = arguments[i];
        if (Array.isArray(msg)) {
            msg.forEach((el) => {
                if (!!el.color && el.color.startsWith('#'))
                    terminal_kit_1.terminal.colorRgbHex(el.color, el.text);
                else if (terminal_kit_1.terminal[el.color] != undefined)
                    terminal_kit_1.terminal[el.color](el.text);
                else
                    terminal_kit_1.terminal(el.text);
            });
        }
        else
            terminal_kit_1.terminal(msg);
        terminal_kit_1.terminal('\n');
    }
}
exports.log = log;
function chat(...args) {
    for (var i = 0; i < arguments.length; i++) {
        terminal_kit_1.terminal('[' + hourNow() + ' - ^yChat^:] ');
        const msg = arguments[i];
        if (Array.isArray(msg)) {
            msg.forEach((el) => {
                if (!!el.color && el.color.startsWith('#'))
                    terminal_kit_1.terminal.colorRgbHex(el.color, el.text);
                else if (terminal_kit_1.terminal[el.color] != undefined)
                    terminal_kit_1.terminal[el.color](el.text);
                else
                    terminal_kit_1.terminal(el.text);
            });
        }
        else
            terminal_kit_1.terminal(msg);
        terminal_kit_1.terminal('\n');
    }
}
exports.chat = chat;
function warn(...args) {
    for (var i = 0; i < arguments.length; i++) {
        terminal_kit_1.terminal('[' + hourNow() + ' - ^RWarning^:] ^R');
        const msg = arguments[i];
        if (Array.isArray(msg)) {
            msg.forEach((el) => {
                if (!!el.color && el.color.startsWith('#'))
                    terminal_kit_1.terminal.colorRgbHex(el.color, el.text);
                else if (terminal_kit_1.terminal[el.color] != undefined)
                    terminal_kit_1.terminal[el.color](el.text);
                else
                    terminal_kit_1.terminal(el.text);
            });
        }
        else
            terminal_kit_1.terminal(msg);
        terminal_kit_1.terminal('\n');
    }
}
exports.warn = warn;
function error(...args) {
    for (var i = 0; i < arguments.length; i++) {
        terminal_kit_1.terminal('[' + hourNow() + ' - ^rError!^:] ^r');
        const msg = arguments[i];
        if (Array.isArray(msg)) {
            msg.forEach((el) => {
                if (!!el.color && el.color.startsWith('#'))
                    terminal_kit_1.terminal.colorRgbHex(el.color, el.text);
                else if (terminal_kit_1.terminal[el.color] != undefined)
                    terminal_kit_1.terminal[el.color](el.text);
                else
                    terminal_kit_1.terminal(el.text);
            });
        }
        else
            terminal_kit_1.terminal(msg);
        terminal_kit_1.terminal('\n');
    }
}
exports.error = error;
function hourNow() {
    var date = new Date();
    var hour = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();
    return ((hour.length == 2 ? hour : '0' + hour) +
        ':' +
        (minutes.length == 2 ? minutes : '0' + minutes) +
        ':' +
        (seconds.length == 2 ? seconds : '0' + seconds));
}
exports.executor = {
    name: '#console',
    id: '#console',
    send: log,
    permissions: new permissions_1.PermissionHolder({ '*': true })
};
exports.executorchat = { ...exports.executor, send: chat };
exports.obj = console.log;
//# sourceMappingURL=console.js.map