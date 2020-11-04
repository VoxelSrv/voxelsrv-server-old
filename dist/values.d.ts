import * as types from './types';
export declare const serverVersion = "0.2.0-beta.11.2";
export declare const serverProtocol = 2;
export interface IServerConfig {
    port: number;
    address: string;
    name: string;
    motd: string;
    public: boolean;
    maxplayers: number;
    viewDistance: number;
    chunkTransportCompression: boolean;
    world: {
        seed: number;
        border: number;
        spawn: types.XYZ;
        generator: string;
        save: boolean;
    };
    plugins: string[];
    consoleInput: boolean;
    [index: string]: any;
}
export declare const serverDefaultConfig: IServerConfig;
export declare const invalidNicknameRegex: RegExp;
export declare const heartbeatServer = "pb4.eu:9001";
//# sourceMappingURL=values.d.ts.map