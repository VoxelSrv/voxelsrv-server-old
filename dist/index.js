"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const fs = __importStar(require("fs"));
const ws_1 = __importDefault(require("ws"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const server_1 = require("./server");
function startServer() {
    let json = '{"port": 3000}';
    if (fs.existsSync('./config/') && fs.existsSync('./config/config.json'))
        json = fs.readFileSync('./config/config.json').toString();
    let cfg = { port: 3000, useWSS: false, wssOptions: { key: '', cert: '' } };
    try {
        cfg = JSON.parse(json.toString());
    }
    catch (e) {
        cfg = { port: 3000, useWSS: false, wssOptions: { key: '', cert: '' } };
        fs.unlinkSync('./config/config.json');
    }
    const httpServer = cfg.useWSS
        ? https_1.default.createServer({
            cert: fs.readFileSync(cfg.wssOptions.cert),
            key: fs.readFileSync(cfg.wssOptions.key),
        })
        : http_1.default.createServer();
    const wss = new ws_1.default.Server({ server: httpServer });
    const server = new server_1.Server();
    wss.on('connection', (s, req) => {
        // @ts-ignore
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        server.connectPlayer(new socket_1.WSSocket(s, ip));
    });
    server.on('server-stopped', () => {
        process.exit();
    });
    httpServer.listen(cfg.port);
    return server;
}
exports.startServer = startServer;
//# sourceMappingURL=index.js.map