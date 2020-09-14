import * as fs from 'fs';

import * as console from './console';
import * as types from '../types';
import { Block, blockIDmap, blockPalette, blockRegistry } from './registry';
import * as format from '../formats/world';

import * as pako from 'pako';

import ndarray = require('ndarray');

const chunkWitdh = 32;
const chunkHeight = 256;

const lastChunk = 5000;

const worlds: { [index: string]: World } = {};

let worldgen = {};

const baseMetadata = { gen: true, ver: 2 };

export function create(name: string, seed: number, generator: string): World | null {
	if (exist(name) == false && worlds[name] == undefined) {
		worlds[name] = new World(name, seed, generator, null);
		return worlds[name];
	} else {
		return null;
	}
}

export function load(name: string): World | null {
	try {
		if (exist(name) == true && worlds[name] == undefined) {
			const readed = fs.readFileSync('./worlds/' + name + '/world.json');
			const data = JSON.parse(readed.toString());
			worlds[name] = new World(name, data.seed, data.generator, data.version);

			return worlds[name];
		} else {
			return null;
		}
	} catch (e) {
		console.error(`Can't load world ${name}! Trying to recreate it...`);
		create(name, 0, 'normal');
	}
}

export function unload(name: string): void {
	worlds[name].unload();
	console.log('Unloaded world ' + name);
}

export function exist(name: string): boolean {
	return fs.existsSync('./worlds/' + name);
}

export function get(name: string): World | undefined {
	return worlds[name];
}

export function validateID(id: number[]): boolean {
	if (id == null || id == undefined) return false;
	else if (id[0] == null || id[0] == undefined) return false;
	else if (id[1] == null || id[1] == undefined) return false;
}

export function globalToChunk(pos: types.XYZ): { id: types.XZ; pos: types.XYZ } {
	const xc = Math.floor(pos[0] / chunkWitdh);
	const zc = Math.floor(pos[2] / chunkWitdh);

	let xl = pos[0] % chunkWitdh;
	let yl = pos[1];
	let zl = pos[2] % chunkWitdh;

	if (xl < 0) xl = xl + chunkWitdh;
	if (zl < 0) zl = zl + chunkWitdh;

	return {
		id: [xc, zc],
		pos: [xl, yl, zl],
	};
}

export function chunkIDFromGlobal(pos: types.XYZ): types.XZ {
	let xz: types.XZ = [Math.floor(pos[0] / chunkWitdh), Math.floor(pos[2] / chunkWitdh)];

	if (xz[0] < 0) xz[0] = xz[0] + chunkWitdh;
	if (xz[1] < 0) xz[1] = xz[1] + chunkWitdh;

	return xz;
}

export function globalToLocal(pos: types.XYZ): types.XYZ {
	return [pos[0] % chunkWitdh, pos[1], pos[2] % chunkWitdh];
}

function getRandomSeed(): number {
	return Math.random() * (9007199254740990 + 9007199254740990) - 9007199254740991;
}

export class World {
	name: string;
	seed: number;
	generator: any;
	version: number;
	chunks: object;
	entities: object;
	folder: string;
	chunkFolder: string;
	autoSaveInterval: any;
	chunkUnloadInterval: any;

	constructor(name: string, seed: number, generator: string, ver: number) {
		this.name = name;
		this.seed = seed != 0 ? seed : getRandomSeed();
		this.generator = new worldgen[generator](this.seed);
		if (ver == null) this.version = 1;
		else this.version = ver;
		this.chunks = {};
		this.entities = {};
		this.folder = './worlds/' + name;
		this.chunkFolder = './worlds/' + name + '/chunks';

		if (!fs.existsSync(this.folder)) fs.mkdirSync(this.folder);
		if (!fs.existsSync(this.chunkFolder)) fs.mkdirSync(this.chunkFolder);

		fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
			if (err) console.error('Cant save world ' + this.name + '! Reason: ' + err);
		});

		this.autoSaveInterval = setInterval(async () => {
			this.saveAll();
		}, 30000);

		this.chunkUnloadInterval = setInterval(async () => {
			const chunklist = Object.keys(this.chunks);
			chunklist.forEach((id) => {
				if (Date.now() - this.chunks[id].lastUse >= 5000 && !!this.chunks[id].forceload) this.unloadChunk(this.stringToID(id));
			});
		}, 1000);
	}

	stringToID(id: string): types.XZ {
		const x = id.split(',');

		return [parseInt(x[0]), parseInt(x[1])];
	}

	async getChunk(id: types.XZ, bool: boolean): Promise<Chunk> {
		const idS = id.toString();
		if (this.chunks[idS] != undefined) {
			return this.chunks[idS];
		} else if (this.existChunk(id)) {
			const data = this.readChunk(id);
			this.chunks[idS] = new Chunk(id, data.chunk, data.metadata, false);
			return this.chunks[idS];
		}
		if (bool) {
			const data = new ndarray(new Uint16Array(chunkWitdh * chunkHeight * chunkWitdh), [chunkWitdh, chunkHeight, chunkWitdh]);
			this.chunks[idS] = new Chunk(id, await this.generator.generateChunk(id, data), { ...baseMetadata }, false);
			return this.chunks[idS];
		}
	}

	existChunk(id: types.XZ): boolean {
		const idS = id.toString();

		const chk = fs.existsSync(this.chunkFolder + '/' + idS + '.chk');
		return chk;
	}

	saveAll(): void {
		const chunklist = Object.keys(this.chunks);

		fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
			if (err) console.error('Cant save world ' + this.name + '! Reason: ' + err);
		});

		chunklist.forEach((id) => {
			this.saveChunk(this.stringToID(id));
		});
	}

	async saveChunk(id: types.XZ) {
		const idS = id.toString();

		const chunk = this.chunks[idS];

		if (chunk == undefined || chunk.metadata == undefined || chunk.data == undefined) return;
		const message = format.chunk.create({
			blocks: chunk.data.data,
			version: chunk.metadata.ver,
			generated: chunk.metadata.gen,
		});
		const buffer = format.chunk.encode(message).finish();
		const data = pako.deflate(buffer);

		fs.writeFile(this.chunkFolder + '/' + idS + '.chk', data, function (err) {
			if (err) console.error('Cant save chunk ' + id + '! Reason: ' + err);
		});
	}

	readChunk(id: types.XZ): { chunk: types.IView3duint16; metadata: object } {
		const idS = id.toString();

		const exist = this.existChunk(id);
		let chunk = null;
		let meta = null;
		if (exist) {
			const data = fs.readFileSync(this.chunkFolder + '/' + idS + '.chk');
			const array = pako.inflate(data, new Uint16Array(chunkWitdh * chunkHeight * chunkWitdh));
			const decoded = format.chunk.decode(array);

			chunk = new ndarray(decoded.blocks, [chunkWitdh, chunkHeight, chunkWitdh]);
		}
		return { chunk: chunk, metadata: meta };
	}

	unloadChunk(id: types.XZ) {
		this.saveChunk(id);
		delete this.chunks[id.toString()];
	}

	getSettings(): object {
		return {
			name: this.name,
			seed: this.seed,
			generator: this.generator.name,
			version: this.version,
		};
	}

	getBlock(data: types.XYZ, allowgen: boolean): Block {
		const local = globalToChunk(data);
		const cid: string = local.id.toString();

		if (this.chunks[cid] != undefined) {
			const id = this.chunks[cid].data.get(local.pos[0], local.pos[1], local.pos[2]);
			this.chunks[cid].keepAlive();
			return blockRegistry[blockIDmap[id]];
		} else if (this.existChunk(local.id)) {
			const data = this.readChunk(local.id);
			this.chunks[cid] = new Chunk(local.id, data.chunk, data.metadata, false);
			this.chunks[cid].keepAlive();
			return blockRegistry[blockIDmap[this.chunks[cid].data.get(local.pos[0], local.pos[1], local.pos[2])]];
		} else if (allowgen) {
			return blockRegistry[blockIDmap[this.generator.getBlock(data[0], data[1], data[2])]];
		}
		return blockRegistry['air'];
	}

	async setBlock(data: types.XYZ, block: string | number | Block, allowgen: boolean = false) {
		const local = globalToChunk(data);
		let id = 0;
		const cid: string = local.id.toString();

		switch (typeof block) {
			case 'number':
				id = block;
				break;
			case 'object':
				id = block.rawid;
				break;
			case 'string':
				id = blockPalette[block];
			default:
				return;
		}

		if (this.chunks[cid] != undefined) {
			this.chunks[cid].data.set(local.pos[0], local.pos[1], local.pos[2], block);
			this.chunks[cid].keepAlive();
		} else if (this.existChunk(local.id)) {
			const data = this.readChunk(local.id);
			this.chunks[cid] = new Chunk(local.id, data.chunk, data.metadata, false);
			this.chunks[cid].data.set(local.pos[0], local.pos[1], local.pos[2], block);
			this.chunks[cid].keepAlive();
		} else if (allowgen) {
			const data = new ndarray(new Uint16Array(chunkWitdh * chunkHeight * chunkWitdh), [chunkWitdh, chunkHeight, chunkWitdh]);
			this.chunks[cid] = new Chunk(local.id, await this.generator.generateChunk(id, data), { ...baseMetadata }, false);
			this.chunks[cid].data.set(local.pos[0], local.pos[1], local.pos[2], block);
			this.chunks[cid].keepAlive();
		}
	}

	unload() {
		this.saveAll();
		clearInterval(this.autoSaveInterval);
		clearInterval(this.chunkUnloadInterval);

		setTimeout(function () {
			delete worlds[this.name];
		}, 50);
	}
}

export class Chunk {
	id: types.XZ;
	data: types.IView3duint16;
	metadata: object;
	lastUse: number;
	forceload: boolean;

	constructor(id: types.XZ, blockdata: types.IView3duint16, metadata: object, bool: boolean) {
		this.id = id;
		this.data = blockdata;
		this.metadata = metadata;
		this.lastUse = Date.now();
		this.forceload = !!bool;
	}

	keepAlive() {
		this.lastUse = Date.now();
	}
}

export function getAll() {
	return worlds;
}
export const toChunk = globalToChunk;
export function addGenerator(name: string, gen: any) {
	worldgen[name] = gen;
}
