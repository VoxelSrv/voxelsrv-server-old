import * as types from './types';
export declare const serverVersion = "0.2.0-beta.21";
export declare const serverProtocol: number;
export interface IServerConfig {
    port: number;
    address: string;
    name: string;
    motd: string;
    public: boolean;
    requireAuth: boolean;
    allowNotLogged: boolean;
    maxplayers: number;
    viewDistance: number;
    chunkTransportCompression: boolean;
    world: {
        seed: number;
        border: number;
        spawn: types.XYZ;
        generator: string;
        save: boolean;
        worldGenWorkers: number;
        borderBlock: string;
    };
    plugins: string[];
    consoleInput: boolean;
    rateLimitChatMessages: boolean;
    useWSS: boolean;
    wssOptions: {
        key: string;
        cert: string;
    };
    [index: string]: any;
}
export declare const serverDefaultConfig: IServerConfig;
export declare const invalidNicknameRegex: RegExp;
export declare const heartbeatServer = "https://voxelsrv.pb4.eu";
//# sourceMappingURL=values.d.ts.map