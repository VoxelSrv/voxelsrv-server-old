/// <reference types="node" />
import { PermissionHolder } from './permissions';
import { EventEmitter } from 'events';
export declare const event: EventEmitter;
export declare function log(...args: any[]): void;
export declare function chat(...args: any[]): void;
export declare function warn(...args: any[]): void;
export declare function error(...args: any[]): void;
export declare const executor: {
    name: string;
    id: string;
    send: typeof log;
    permissions: PermissionHolder;
};
export declare const executorchat: {
    send: typeof chat;
    name: string;
    id: string;
    permissions: PermissionHolder;
};
export declare const obj: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
//# sourceMappingURL=console.d.ts.map