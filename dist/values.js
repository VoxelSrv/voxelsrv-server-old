"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heartbeatServer = exports.invalidNicknameRegex = exports.serverDefaultConfig = exports.serverProtocol = exports.serverVersion = void 0;
const const_json_1 = require("voxelsrv-protocol/const.json");
exports.serverVersion = '0.2.0-beta.21';
exports.serverProtocol = const_json_1.protocolVersion;
exports.serverDefaultConfig = {
    port: 3000,
    address: '0.0.0.0',
    name: 'Server',
    motd: 'Another VoxelSRV server',
    public: false,
    requireAuth: true,
    allowNotLogged: true,
    maxplayers: 10,
    viewDistance: 5,
    chunkTransportCompression: true,
    world: {
        seed: 0,
        border: 256,
        spawn: [0, 100, 0],
        generator: 'normal',
        save: true,
        worldGenWorkers: 1,
        borderBlock: 'barrier',
    },
    plugins: [],
    consoleInput: true,
    rateLimitChatMessages: true,
    useWSS: false,
    wssOptions: { key: '', cert: '' },
};
exports.invalidNicknameRegex = new RegExp('[^a-zA-Z0-9_]');
exports.heartbeatServer = 'https://voxelsrv.pb4.eu';
//export const heartbeatServer = 'http://localhost:9001';
//# sourceMappingURL=values.js.map