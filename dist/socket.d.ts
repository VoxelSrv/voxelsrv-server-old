import type WebSocket from 'ws';
export declare class BaseSocket {
    socket: any;
    listeners: Object;
    debugListener: (sender: string, type: string, data: object) => void;
    ip: string;
    constructor(ip: string);
    send(type: string, data: Object): void;
    close(): void;
    protected emit(type: any, data: any): void;
    on(type: string, func: Function): void;
}
export declare class WSSocket extends BaseSocket {
    constructor(socket: WebSocket, ip: string);
    close(): void;
}
//# sourceMappingURL=socket.d.ts.map