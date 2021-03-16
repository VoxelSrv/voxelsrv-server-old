import type WebSocket from 'ws';
export declare class BaseSocket {
    socket: any;
    listeners: {
        [i: string]: {
            callback: (data: any) => void;
            remove: boolean;
        }[];
    };
    debugListener: (sender: string, type: string, data: object) => void;
    ip: string;
    constructor(ip: string);
    send(type: string, data: Object): void;
    close(): void;
    protected emit(type: any, data: any): void;
    on(type: string, func: (data: any) => void): void;
    once(type: string, func: (data: any) => void): void;
}
export declare class WSSocket extends BaseSocket {
    constructor(socket: WebSocket, ip: string);
    close(): void;
}
//# sourceMappingURL=socket.d.ts.map