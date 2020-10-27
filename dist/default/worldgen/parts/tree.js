"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.birchTree = exports.oakTree = void 0;
const ndarray = require("ndarray");
function oakTree(seed, hash, block) {
    const gen = new ndarray(new Uint16Array(16 * 16 * 16), [16, 16, 16]);
    const size = Math.round(hash(seed * 5, 5483));
    const height = 5 + Math.round(hash(seed)) + size * 2;
    for (let y = 0; y < height; y++) {
        gen.set(8, y, 8, block.log);
    }
    for (let x = -5; x <= 5; x++) {
        for (let y = -4; y <= 5; y++) {
            for (let z = -5; z <= 5; z++) {
                if (gen.get(x + 8, y + height, z + 8) != block.log && hash(x, y, z, seed * 2) > 0.3 && dist(x, y, z) <= 4 + size)
                    gen.set(x + 8, y + height, z + 8, block.leaves);
            }
        }
    }
    return gen;
}
exports.oakTree = oakTree;
function birchTree(seed, hash, block) {
    const gen = new ndarray(new Uint16Array(16 * 16 * 16), [16, 16, 16]);
    const size = Math.round(hash(seed * 3, 5483));
    const height = 6 + Math.round(hash(seed)) + size * 2;
    for (let y = 0; y < height; y++) {
        gen.set(8, y, 8, block.birch_log);
    }
    for (let x = -5; x <= 5; x++) {
        for (let y = -5; y <= 5; y++) {
            for (let z = -5; z <= 5; z++) {
                if (gen.get(x + 8, y + height, z + 8) != block.birch_log && hash(x, y, z, seed * 2) > 0.3 && dist(x, y, z) <= 4 + size)
                    gen.set(x + 8, y + height, z + 8, block.birch_leaves);
            }
        }
    }
    return gen;
}
exports.birchTree = birchTree;
function dist(x, y, z) {
    return Math.sqrt(x * x + y * y + z * z);
}
//# sourceMappingURL=tree.js.map