import * as fs from 'fs';

import * as console from './console';
import * as types from './types';

import * as crunch from 'voxel-crunch';

const ndarray = require('ndarray');


const blockIDs = require('./blocks').getIDs();

const chunkWitdh = 24;
const chunkHeight = 120;

const lastChunk = 5000;

const worlds = {};

let worldgen = {
	normal: require('./worldgen/normal'),
	flat: require('./worldgen/flat')
};

const baseMetadata = {gen: true, ver: 1};

export function create(name: string, seed: number, generator: string): World | null {
	if ( exist(name) == false && worlds[name] == undefined ) {
		worlds[name] = new World(name, seed, generator, null);
		return worlds[name];
	} else { return null; }
}

export function load(name: string): World | null  {

	if ( exist(name) == true && worlds[name] == undefined ) {
		const readed = fs.readFileSync('./worlds/' + name + '/world.json')
		const data = JSON.parse( readed.toString() );
		worlds[name] = new World(name, data.seed, data.generator, data.version);

		return worlds[name];
	} else { return null; }
}

export function unload(name: string): void {
	worlds[name].unload();
	console.log('Unloaded world ' + name);

}

export function exist(name: string): boolean {
	return fs.existsSync( './worlds/' + name);
}

export function get(name: string): World | undefined {
	return worlds[name];
}

export function validateID(id: number[]): boolean {
	if (id == null || id == undefined) return false;
	else if (id[0] == null || id[0] == undefined) return false;
	else if (id[1] == null || id[1] == undefined) return false;
}

export function globalToChunk(pos: types.XYZ): {id: types.XZ, pos: types.XYZ} {
	const xc = Math.floor(pos[0]/24);
	const zc = Math.floor(pos[2]/24);

	let xl = pos[0] % 24;
	let yl = pos[1];
	let zl = pos[2] % 24;

	if (xl < 0) xl = xl + 24;
	if (zl < 0) zl = zl + 24;

	return {
		id: [xc, zc],
		pos: [xl, yl, zl]
	};
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
		this.seed = seed;
		this.generator = new worldgen[generator](seed, blockIDs);
		if (ver == null) this.version = 1;
		else this.version = ver;
		this.chunks = {};
		this.entities = {};
		this.folder = './worlds/' + name;
		this.chunkFolder = './worlds/' + name + '/chunks';

		if (!fs.existsSync(this.folder) ) fs.mkdirSync(this.folder);
		if (!fs.existsSync(this.chunkFolder) ) fs.mkdirSync(this.chunkFolder);

		fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
			if (err) console.error ('Cant save world ' + this.name + '! Reason: ' + err);
		})

		this.autoSaveInterval = setInterval( async () => { this.saveAll(); }, 30000);

		this.chunkUnloadInterval = setInterval( async () => { 
			const chunklist = Object.keys(this.chunks);
			chunklist.forEach( (id) => {
				if (Date.now() - this.chunks[id].lastUse >= 5000 && !!this.chunks[ id ].forceload) this.unloadChunk( this.stringToID( id ) );
			})
		}, 1000)

	}

	stringToID(id: string): types.XZ {
		const x = id.split(',')

		return [ parseInt( x[0] ), parseInt( x[1] ) ]
	}

	async getChunk(id: types.XZ, bool: boolean): Promise<Chunk> {
		const idS = id.toString()
		if (this.chunks[idS] != undefined) {
			return this.chunks[idS];
		}
		else if ( this.existChunk(id).metadata ) {
			const data = this.readChunk(id);
			this.chunks[idS] = new Chunk(id, data.chunk, data.metadata, false);
			return this.chunks[idS];
		}
		if (bool) {
			if ( this.existChunk(id).chunk ) {
				const data = this.readChunk(id);
				this.chunks[idS] = new Chunk(id, data.chunk, {...baseMetadata}, false);
				return this.chunks[idS];
			} else {
				const data = new ndarray( new Uint16Array(chunkWitdh * chunkHeight * chunkWitdh), [chunkWitdh, chunkHeight, chunkWitdh]);

				const chunk = this.generator.generateChunk(id, data);
				this.chunks[idS] = new Chunk(id, chunk, {...baseMetadata}, false);

				return this.chunks[idS];

			}
		}
	}

	existChunk(id: types.XZ): { chunk: boolean, metadata: boolean } {
		const idS = id.toString();

		const chk = fs.existsSync(this.chunkFolder + '/' + idS + '.chk');
		const meta = fs.existsSync(this.chunkFolder + '/' + idS + '.json');
		return { chunk: chk, metadata: meta };
	}

	saveAll(): void {
		const chunklist = Object.keys(this.chunks);

		fs.writeFile(this.folder + '/world.json', JSON.stringify(this.getSettings()), function (err) {
			if (err) console.error ('Cant save world ' + this.name + '! Reason: ' + err);
		})

		chunklist.forEach( (id) => { this.saveChunk( this.stringToID(id) ) } );
	}

	saveChunk(id: types.XZ) {
		const idS = id.toString();

		const chunk = this.chunks[idS];

		const data = Buffer.from( crunch.encode(chunk.data.data) )

		fs.writeFile(this.chunkFolder + '/' + idS +'.chk', data, function (err) {
			if (err) console.error ('Cant save chunk ' + id + '! Reason: ' + err)
		})
	
		fs.writeFile(this.chunkFolder + '/' + idS + '.json', JSON.stringify(chunk.metadata), function (err) {
			if (err) console.error ('Cant save chunkdata ' + id + '! Reason: ' + err)
		})
	}

	readChunk(id: types.XZ): {chunk: Uint16Array, metadata: object} {
		const idS = id.toString();

		const exist = this.existChunk(id)
		let chunk = null
		let meta = null
		if (exist.chunk) {
			const data = fs.readFileSync(this.chunkFolder + '/' + idS + '.chk')
			const array = crunch.decode([...data], new Uint16Array(24*120*24) )
			chunk = new ndarray(array, [24, 120, 24])
		}
		if (exist.metadata) {
			let data = fs.readFileSync(this.chunkFolder + '/' + idS + '.json')
			meta = JSON.parse( data.toString() )
		}
		return {chunk: chunk, metadata: meta}
	}

	unloadChunk(id: types.XZ) {
		this.saveChunk( id )
		delete this.chunks[ id.toString() ]
	}

	getSettings(): object {
		return {
			name: this.name,
			seed: this.seed,
			generator: this.generator.name,
			version: this.version
		}
	}


	getBlock(data: types.XYZ, bool: boolean) {
		const local = globalToChunk(data);
		if (this.chunks[ local.id.toString() ] != undefined) return this.chunks[ local.id.toString() ].data.get(local.pos[0], local.pos[1], local.pos[2]);
	}

	setBlock(data: types.XYZ, block: string, bool: boolean) {
		const local = globalToChunk(data);
		if (this.chunks[ local.id.toString() ] != undefined) this.chunks[ local.id.toString() ].data.set(local.pos[0], local.pos[1], local.pos[2], block);
	}

	unload() {
		this.saveAll();
		clearInterval(this.autoSaveInterval);
		clearInterval(this.chunkUnloadInterval);

		setTimeout(function() { delete worlds[this.name] }, 50);
	}
}


export class Chunk {
	id: types.XZ;
	data: Uint16Array;
	metadata: object;
	lastUse: number;
	forceload: boolean;
	
	constructor(id: types.XZ, blockdata: Uint16Array, metadata: object, bool: boolean) {
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

export function getAll() { return worlds; }
export const toChunk = globalToChunk;
export function addGenerator(name, worldgen) { worldgen[ name ] = worldgen; } 
