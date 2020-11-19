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

export function yellowOakTree(seed: number, hash, block): types.IView3duint16 {
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
					gen.set(x + 8, y + height, z + 8, block.leaves_yellow);
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

export function spruceTree(seed: number, hash, block): types.IView3duint16 {
	const gen = new ndarray(new Uint16Array(16 * 16 * 16), [16, 16, 16]);
	const size = Math.round(hash(seed * 3, 5483));
	const height = 8 + size * 2;

	for (let y = 0; y < height; y++) {
		gen.set(8, y, 8, block.spruce_log);
	}

	gen.set(8, height, 8, block.spruce_leaves);
	let add = 0;
	if (height % 2 == 1) add = -1;
	if (height <= 8) {
		for (let x = -3; x <= 3; x++) {
			for (let z = -3; z <= 3; z++) {
				if (dist(x, 0, z) < 1.4 && gen.get(8 + x, height - 1, 8 + z) == 0) gen.set(8 + x, height - 1, 8 + z, block.spruce_leaves);
				if (dist(x, 0, z) < 2.8 && gen.get(8 + x, height - 3, 8 + z) == 0) gen.set(8 + x, height - 3, 8 + z, block.spruce_leaves);
				if (dist(x, 0, z) < 1.4 && gen.get(8 + x, height - 4, 8 + z) == 0) gen.set(8 + x, height - 4, 8 + z, block.spruce_leaves);
				if (dist(x, 0, z) < 2.8 && gen.get(8 + x, height - 5, 8 + z) == 0) gen.set(8 + x, height - 5, 8 + z, block.spruce_leaves);
				if (dist(x, 0, z) < 1.4 && gen.get(8 + x, height - 6, 8 + z) == 0) gen.set(8 + x, height - 6, 8 + z, block.spruce_leaves);
			}
		}
	} else if (height > 8) {
		for (let x = -3; x <= 3; x++) {
			for (let z = -3; z <= 3; z++) {
				if (dist(x, 0, z) < 1.4 && gen.get(8 + x, height - 1, 8 + z) == 0) gen.set(8 + x, height - 1, 8 + z, block.spruce_leaves);
				if (dist(x, 0, z) < 2.8 && gen.get(8 + x, height - 3, 8 + z) == 0) gen.set(8 + x, height - 3, 8 + z, block.spruce_leaves);
				if (dist(x, 0, z) < 1.4 && gen.get(8 + x, height - 4, 8 + z) == 0) gen.set(8 + x, height - 4, 8 + z, block.spruce_leaves);
				if (dist(x, 0, z) < 2.8 && gen.get(8 + x, height - 5, 8 + z) == 0) gen.set(8 + x, height - 5, 8 + z, block.spruce_leaves);
				if (dist(x, 0, z) < 3.6 && gen.get(8 + x, height - 6, 8 + z) == 0) gen.set(8 + x, height - 6, 8 + z, block.spruce_leaves);
				if (dist(x, 0, z) < 1.4 && gen.get(8 + x, height - 7, 8 + z) == 0) gen.set(8 + x, height - 7, 8 + z, block.spruce_leaves);
			}
		}
	}

	return gen;
}

function dist(x: number, y: number, z: number): number {
	return Math.sqrt(x * x + y * y + z * z);
}
