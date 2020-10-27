export declare class BaseSocket {
    socket: any;
    listeners: Object;
    server: string;
    constructor();
    send(type: string, data: Object): void;
    close(): void;
    protected emit(type: any, data: any): void;
    on(type: string, func: Function): void;
}
export declare class WSSocket extends BaseSocket {
    constructor(socket: any);
    close(): void;
}
//# sourceMappingURL=socket.d.ts.map