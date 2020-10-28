"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSSocket = exports.BaseSocket = void 0;
const protocol = __importStar(require("./lib/protocol"));
class BaseSocket {
    constructor() {
        this.listeners = {};
    }
    send(type, data) {
        const packet = protocol.parseToMessage('server', type, data);
        if (packet != null) {
            this.socket.send(packet);
        }
    }
    close() {
        this.emit('close', true);
        this.listeners = {};
    }
    emit(type, data) {
        if (this.listeners[type] != undefined) {
            this.listeners[type].forEach((func) => {
                func(data);
            });
        }
    }
    on(type, func) {
        if (this.listeners[type] != undefined) {
            this.listeners[type].push(func);
        }
        else {
            this.listeners[type] = new Array();
            this.listeners[type].push(func);
        }
    }
}
exports.BaseSocket = BaseSocket;
class WSSocket extends BaseSocket {
    constructor(socket) {
        super();
        this.socket = socket;
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = () => {
            this.emit('connection', {});
        };
        this.socket.on('error', () => {
            this.emit('error', { reason: `Connection error!` });
        });
        this.socket.on('close', () => {
            this.emit('close', { reason: `Connection closed!` });
        });
        this.socket.on('message', (m) => {
            const packet = protocol.parseToObject('client', new Uint8Array(m));
            if (packet != null)
                this.emit(packet.type, packet.data);
        });
    }
    close() {
        this.emit('close', true);
        this.listeners = {};
        this.socket.close();
    }
}
exports.WSSocket = WSSocket;
//# sourceMappingURL=socket.js.map