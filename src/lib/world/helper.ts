import * as types from '../../types';


export function globalToChunk(pos: types.XYZ): { id: types.XZ; pos: types.XYZ } {
	const xc = Math.floor(pos[0] / 32);
	const zc = Math.floor(pos[2] / 32);

	let xl = pos[0] % 32;
	let yl = pos[1];
	let zl = pos[2] % 32;

	if (xl < 0) xl = xl + 32;
	if (zl < 0) zl = zl + 32;

	return {
		id: [xc, zc],
		pos: [xl, yl, zl],
	};
}

export function chunkIDFromGlobal(pos: types.XYZ): types.XZ {
	let xz: types.XZ = [Math.floor(pos[0] / 32), Math.floor(pos[2] / 32)];

	if (xz[0] < 0) xz[0] = xz[0] + 32;
	if (xz[1] < 0) xz[1] = xz[1] + 32;

	return xz;
}

export function globalToLocal(pos: types.XYZ): types.XYZ {
	return [pos[0] % 32, pos[1], pos[2] % 32];
}

export function getRandomSeed(): number {
	return Math.random() * (9007199254740990 + 9007199254740990) - 9007199254740991;
}

export function validateID(id: number[]): boolean {
	if (id == null || id == undefined) return false;
	else if (id[0] == null || id[0] == undefined) return false;
	else if (id[1] == null || id[1] == undefined) return false;
}