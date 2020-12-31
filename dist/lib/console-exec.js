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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCmd = void 0;
const chat_1 = require("./chat");
const readline = __importStar(require("readline"));
function startCmd(server, commands) {
    let running = true;
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const history = [];
    rl.on('SIGINT', () => {
        server.stopServer();
    });
    rl.on('line', (input) => {
        if (server.status != 'active')
            return;
        history.push(input);
        const arg = ('/' + input).split(' ');
        const command = arg[0];
        arg.shift();
        if (commands[command]) {
            try {
                commands[command].trigger(server.console.executor, arg);
            }
            catch (e) {
                server.log.error([new chat_1.ChatComponent('An error occurred during the execution of this command!', 'red')]);
            }
        }
        else
            server.log.normal([new chat_1.ChatComponent("This command doesn't exist! Check /help for list of available commands.", 'red')]);
        rl.prompt();
    });
}
exports.startCmd = startCmd;
//# sourceMappingURL=console-exec.js.map