import * as fs from 'fs';

import * as console from './console';
import * as types from '../types';
import type { Server } from '../server';
import * as format from '../formats/world';
import { Block } from './registry';

import * as pako from 'pako';

import ndarray = require('ndarray');

export class WorldManager {
	readonly chunkWitdh = 32;
	readonly chunkHeight = 256;

	readonly lastChunk = 5000;

	worlds: { [index: string]: World } = {};
	worldgenerators = {};

	readonly _baseMetadata = { ver: 2, stage: 0 };

	server: Server;

	constructor(server) {
		this.server = server;
	}

	create(name: string, seed: number, generator: string): World | null {
		if (this.exist(name) == false && this.worlds[name] == undefined) {
			this.worlds[name] = new World(name, seed, generator, null, this.server);
			return this.worlds[name];
		} else {
			return null;
		}
	}

	load(name: string): World | null {
		try {
			if (this.exist(name) == true && this.worlds[name] == undefined) {
				const readed = fs.readFileSync('./worlds/' + name + '/world.json');
				const data = JSON.parse(readed.toString());
				this.worlds[name] = new World(name, data.seed, data.generator, data.version, this.server);

				return this.worlds[name];
			} else {
				return null;
			}
		} catch (e) {
			console.error(`Can't load world ${name}! Trying to recreate it...`);
			this.create(name, 0, 'normal');
		}
	}

	unload(name: string): void {
		this.worlds[name].unload();
		console.log('Unloaded world ' + name);
	}

	exist(name: string): boolean {
		return fs.existsSync('./worlds/' + name);
	}

	get(name: string): World | undefined {
		return this.worlds[name];
	}

	addGenerator(name: string, gen: any) {
		this.worldgenerators[name] = gen;
	}
}

export class World {
	name: string;
	seed: number;
	generator: any;
	version: number;
	chunks: {[index: string]: Chunk};
	entities: object;
	folder: string;
	chunkFolder: string;
	autoSaveInterval: any;
	chunkUnloadInterval: any;
	_server: Server;
	_worldMen: WorldManager;

	constructor(name: string, seed: number, generator: string, ver: number, server: Server) {
		this._server = server;
		this._worldMen = server.worlds;
		this.name = name;
		this.seed = seed != 0 ? seed : getRandomSeed();
		this.generator = new server.worlds.worldgenerators[generator](this.seed, server);
		if (ver == null) this.version = 1;
		else this.version = ver;
		this.chunks = {};
		this.entities = {};
		this.folder = './worlds/' + name;
		this.chunkFolder = './worlds/' + name + '/chunks';

		if (this._server.config.world.save) {
			if (!fs.existsSync(this.folder)) fs.mkdirSync(this.folder);
			if (!fs.existsSync(this.chunkFolder)) fs.mkdirSync(this.chunkFolder);

			fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
				if (err) console.error('Cant save world ' + this.name + '! Reason: ' + err);
			});

			this.autoSaveInterval = setInterval(async () => {
				this.saveAll();
			}, 30000);
		}

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

	async getChunk(id: types.XZ): Promise<Chunk> {
		const idS = id.toString();
		const chunkIDs = this.getNeighborIDsChunks(id);
		const chunks = {};

		await chunkIDs.forEach(async (cid) => {
			chunks[cid.toString()] = await this.getRawChunk(cid, true);
		});

		if (this.chunks[idS].metadata.stage < 1) {
			await this.generator.generateChunk(id, this.chunks[idS].data, this);
			this.chunks[idS].metadata.stage = 1;
		}
		return this.chunks[idS];
	}

	async getRawChunk(id: types.XZ, bool: boolean): Promise<Chunk> {
		const idS = id.toString();
		if (this.chunks[idS] != undefined) {
			this.chunks[idS].keepAlive();
			return this.chunks[idS];
		} else if (this.existChunk(id)) {
			const data = this.readChunk(id);
			this.chunks[idS] = new Chunk(id, data.chunk, data.metadata, false);
			this.chunks[idS].keepAlive();
			return this.chunks[idS];
		}
		if (bool) {
			this.chunks[idS] = new Chunk(id, await this.generator.generateBaseChunk(id), { ...this._worldMen._baseMetadata }, false);
			this.chunks[idS].keepAlive();
			return this.chunks[idS];
		}
	}

	getNeighborIDsChunks(id: types.XZ): types.XZ[] {
		const obj = [];
		let x: number, z: number;

		for (x = id[0] - 1; x != id[0] + 2; x++) {
			for (z = id[1] - 1; z != id[1] + 2; z++) {
				obj.push([x, z]);
			}
		}

		return obj;
	}

	existChunk(id: types.XZ): boolean {
		const idS = id.toString();

		const chk = fs.existsSync(this.chunkFolder + '/' + idS + '.chk');
		return chk;
	}

	saveAll(): void {
		if (!this._server.config.world.save) return;
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
			blocks: Buffer.from(chunk.data.data.buffer, chunk.data.data.byteOffset),
			version: chunk.metadata.ver,
			stage: chunk.metadata.stage,
		});

		const buffer = format.chunk.encode(message).finish();
		const data = pako.deflate(buffer);

		fs.writeFile(this.chunkFolder + '/' + idS + '.chk', data, function (err) {
			if (err) console.error('Cant save chunk ' + id + '! Reason: ' + err);
		});
	}

	readChunk(id: types.XZ): { chunk: types.IView3duint16; metadata: any } {
		const idS = id.toString();

		const exist = this.existChunk(id);
		let chunk = null;
		let meta = null;
		if (exist) {
			const data = fs.readFileSync(this.chunkFolder + '/' + idS + '.chk');
			const array = pako.inflate(data);
			const decoded = format.chunk.decode(array);

			chunk = new ndarray(new Uint16Array(decoded.blocks.buffer, decoded.blocks.byteOffset), [this._worldMen.chunkWitdh, this._worldMen.chunkHeight, this._worldMen.chunkWitdh]);
			meta = { stage: decoded.stage, version: decoded.version };
		}
		return { chunk: chunk, metadata: meta };
	}

	unloadChunk(id: types.XZ) {
		if (this._server.config.world.save) this.saveChunk(id);
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
			return this._server.registry.blocks[this._server.registry.blockIDmap[id]];
		} else if (this.existChunk(local.id)) {
			const data = this.readChunk(local.id);
			this.chunks[cid] = new Chunk(local.id, data.chunk, data.metadata, false);
			this.chunks[cid].keepAlive();
			return this._server.registry.blocks[this._server.registry.blockIDmap[this.chunks[cid].data.get(local.pos[0], local.pos[1], local.pos[2])]];
		} else if (allowgen) {
			return this._server.registry.blocks[this._server.registry.blockIDmap[this.generator.getBlock(data[0], data[1], data[2])]];
		}
		return this._server.registry.blocks['air'];
	}

	async setBlock(data: types.XYZ, block: string | number | Block, allowgen: boolean = false) {
		const local = globalToChunk(data);
		let id = 0;
		switch (typeof block) {
			case 'number':
				id = block;
				break;
			case 'object':
				id = block.rawid;
				break;
			case 'string':
				id = this._server.registry.blockPalette[block];
			default:
				return;
		}

		const chunk = await this.getChunk(local.id);
		chunk.data.set(local.pos[0], local.pos[1], local.pos[2], id);
	}

	async setRawBlock(data: types.XYZ, block: number) {
		const local = globalToChunk(data);
		const chunk = await this.getRawChunk(local.id, true);
		chunk.keepAlive();
		chunk.data.set(local.pos[0], local.pos[1], local.pos[2], block);
	}

	unload() {
		this.saveAll();
		clearInterval(this.autoSaveInterval);
		clearInterval(this.chunkUnloadInterval);

		setTimeout(() => {
			delete this._worldMen.worlds[this.name];
		}, 50);
	}
}

export class Chunk {
	id: types.XZ;
	data: types.IView3duint16;
	metadata: any;
	lastUse: number;
	forceload: boolean;

	constructor(id: types.XZ, blockdata: types.IView3duint16, metadata: object, bool: boolean) {
		this.id = id;
		this.data = blockdata;
		this.metadata = metadata;
		this.lastUse = Date.now();
		this.forceload = !!bool;
	}

	set(x: number, y: number, z: number, id: number) {
		this.data.set(x, y, z, id);
	}

	get(x: number, y: number, z: number): number {
		return this.data.get(x, y, z);
	}

	keepAlive() {
		this.lastUse = Date.now();
	}
}

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
