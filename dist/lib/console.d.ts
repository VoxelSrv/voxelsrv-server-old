/// <reference types="node" />
import { PermissionHolder } from './permissions';
import * as fs from 'fs';
export declare class Logging {
    logFile: fs.WriteStream;
    constructor(out: fs.WriteStream);
    normal(...args: any[]): void;
    chat(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    executor: {
        name: string;
        id: string;
        send: (...args: any[]) => void;
        permissions: PermissionHolder;
    };
    executorchat: {
        send: (...args: any[]) => void;
        name: string;
        id: string;
        permissions: PermissionHolder;
    };
}
//# sourceMappingURL=console.d.ts.map