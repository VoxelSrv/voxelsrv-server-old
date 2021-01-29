"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateID = exports.getRandomSeed = exports.globalToLocal = exports.chunkIDFromGlobal = exports.globalToChunk = void 0;
function globalToChunk(pos) {
    const xc = Math.floor(pos[0] / 32);
    const zc = Math.floor(pos[2] / 32);
    let xl = pos[0] % 32;
    let yl = pos[1];
    let zl = pos[2] % 32;
    if (xl < 0)
        xl = xl + 32;
    if (zl < 0)
        zl = zl + 32;
    return {
        id: [xc, zc],
        pos: [xl, yl, zl],
    };
}
exports.globalToChunk = globalToChunk;
function chunkIDFromGlobal(pos) {
    let xz = [Math.floor(pos[0] / 32), Math.floor(pos[2] / 32)];
    if (xz[0] < 0)
        xz[0] = xz[0] + 32;
    if (xz[1] < 0)
        xz[1] = xz[1] + 32;
    return xz;
}
exports.chunkIDFromGlobal = chunkIDFromGlobal;
function globalToLocal(pos) {
    return [pos[0] % 32, pos[1], pos[2] % 32];
}
exports.globalToLocal = globalToLocal;
function getRandomSeed() {
    return Math.random() * (9007199254740990 + 9007199254740990) - 9007199254740991;
}
exports.getRandomSeed = getRandomSeed;
function validateID(id) {
    if (id == null || id == undefined)
        return false;
    else if (id[0] == null || id[0] == undefined)
        return false;
    else if (id[1] == null || id[1] == undefined)
        return false;
}
exports.validateID = validateID;
//# sourceMappingURL=helper.js.map