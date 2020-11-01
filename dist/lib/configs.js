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
exports.save = exports.load = void 0;
const fs = __importStar(require("fs"));
const console_1 = require("./console");
function load(namespace, config) {
    if (fs.existsSync(`./config/${namespace}/${config}.json`)) {
        try {
            const data = fs.readFileSync(`./config/${namespace}/${config}.json`);
            return JSON.parse(data.toString());
        }
        catch (e) {
            console_1.error(`Invalid config file (./config/${namespace}/${config}.json)!\n${e}`);
            return {};
        }
    }
    else
        return {};
}
exports.load = load;
function save(namespace, config, data) {
    if (!fs.existsSync(`./config/${namespace}`))
        fs.mkdirSync(`./config/${namespace}`, { recursive: true });
    fs.writeFile(`./config/${namespace}/${config}.json`, JSON.stringify(data, null, 2), function (err) {
        if (err)
            console_1.error(`Cant save config ${namespace}/${config}! Reason: ${err}`);
    });
}
exports.save = save;
//# sourceMappingURL=configs.js.map