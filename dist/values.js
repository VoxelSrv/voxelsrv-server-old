"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heartbeatServer = exports.invalidNicknameRegex = exports.serverDefaultConfig = exports.serverProtocol = exports.serverVersion = void 0;
exports.serverVersion = '0.2.0-beta.19.3';
exports.serverProtocol = 3;
exports.serverDefaultConfig = {
    port: 3000,
    address: '0.0.0.0',
    name: 'Server',
    motd: 'Another VoxelSRV server',
    public: false,
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
    },
    plugins: [],
    consoleInput: true,
    rateLimitChatMessages: true,
};
exports.invalidNicknameRegex = new RegExp('[^a-zA-Z0-9_]');
exports.heartbeatServer = 'https://voxelsrv.pb4.eu';
//# sourceMappingURL=values.js.map