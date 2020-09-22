import ndarray = require('ndarray');
import * as types from '../../../types';



export function oakTree(seed: number, hash, block): types.IView3duint16 {
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

export function birchTree(seed: number, hash, block): types.IView3duint16 {
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

function dist(x: number, y: number, z: number): number {
	return Math.sqrt(x * x + y * y + z * z);
}
