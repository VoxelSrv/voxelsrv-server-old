import hash from 'murmur-numbers';
import ndarray = require('ndarray');
import * as types from '../../../types';
import { blockPalette as block } from '../../../lib/registry';

export function oakTree(seed: number): types.IView3duint16 {
	const gen = new ndarray(new Uint16Array(16 * 16 * 16), [16, 16, 16]);
	const size = Math.round(hash(seed * 5));
	const height = 4 + Math.round(hash(seed)) + size * 2;
	for (let y = 0; y < height; y++) {
		gen.set(8, y, 8, block.log);
	}
	for (let x = -4; x <= 4; x++) {
		for (let y = -4; y <= 5; y++) {
			for (let z = -4; z <= 4; z++) {
				if (gen.get(x + 8, y + height, z + 8) == 0 && hash(x, y, z, seed * 2) > 0.3 && dist(x, y, z) <= 3 + size)
					gen.set(x + 8, y + height, z + 8, block.leaves);
			}
		}
	}

	return gen;
}

export function birchTree(seed: number): types.IView3duint16 {
	const gen = new ndarray(new Uint16Array(16 * 16 * 16), [16, 16, 16]);
	const size = Math.round(hash(seed * 3));
	const height = 5 + Math.round(hash(seed)) + size * 2;

	for (let y = 0; y < height; y++) {
		gen.set(8, y, 8, block.birch_log);
	}

	for (let x = -5; x <= 5; x++) {
		for (let y = -5; y <= 5; y++) {
			for (let z = -5; z <= 5; z++) {
				if (
					gen.get(x + 8, y + height, z + 8) == 0 &&
					hash(x, y, z, seed * 2) > 0.3 &&
					dist(x, y, z) <= 4 + size - Math.round(hash(x, y, z, seed * 7))
				)
					gen.set(x + 8, y + height, z + 8, block.birch_leaves);
			}
		}
	}

	return gen;
}

function dist(x: number, y: number, z: number): number {
	return Math.sqrt(x * x + y * y + z * z);
}