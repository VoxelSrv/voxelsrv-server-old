/// <reference types="node" />
import * as fs from 'fs';
export declare class Logging {
    logFile: fs.WriteStream;
    constructor(out: fs.WriteStream);
    normal(...args: any[]): void;
    chat(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
//# sourceMappingURL=console.d.ts.map