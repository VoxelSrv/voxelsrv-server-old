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
const console = __importStar(require("./console"));
const chat_1 = require("./chat");
const terminal_kit_1 = require("terminal-kit");
function startCmd(commands) {
    let running = true;
    const history = [];
    const x = async () => {
        let input;
        while (running) {
            input = await terminal_kit_1.terminal.inputField({
                history: history,
                autoComplete: [],
                autoCompleteMenu: false,
            }).promise;
            if (input != '') {
                terminal_kit_1.terminal('\n');
                const arg = ('/' + input).split(' ');
                const command = arg[0];
                arg.shift();
                console.event.emit('console-executecommand', console.executor, command, arg);
                history.push(input);
                if (commands[command]) {
                    try {
                        commands[command].trigger(console.executor, arg);
                    }
                    catch (e) {
                        console.log([new chat_1.ChatComponent('An error occurred during the execution of this command!', 'red')]);
                    }
                }
                else
                    console.log([new chat_1.ChatComponent("This command doesn't exist! Check /help for list of available commands.", 'red')]);
            }
        }
    };
    x();
}
exports.startCmd = startCmd;
//# sourceMappingURL=console-exec.js.map