"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heartbeatServer = exports.invalidNicknameRegex = exports.serverDefaultConfig = exports.serverProtocol = exports.serverVersion = void 0;
exports.serverVersion = '0.2.0-beta.11.2';
exports.serverProtocol = 2;
exports.serverDefaultConfig = {
    port: 3000,
    address: '0.0.0.0',
    name: 'Server',
    motd: 'Another VoxelSRV server',
    public: false,
    maxplayers: 10,
    viewDistance: 5,
    chunkTransportCompression: false,
    world: {
        seed: 0,
        border: 24,
        spawn: [0, 100, 0],
        generator: 'normal',
        save: true,
    },
    plugins: [],
    consoleInput: true,
};
exports.invalidNicknameRegex = new RegExp('[^a-zA-Z0-9_]');
exports.heartbeatServer = 'pb4.eu:9001';
//# sourceMappingURL=values.js.map