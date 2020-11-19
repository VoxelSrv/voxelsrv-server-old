import type WebSocket from 'ws';
export declare class BaseSocket {
    socket: any;
    listeners: Object;
    server: string;
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