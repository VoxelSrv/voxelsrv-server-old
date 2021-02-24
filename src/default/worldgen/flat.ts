import * as types from '../../types';
import * as biome from './parts/biomes';
import ndarray = require('ndarray');
import type { World, IWorldGenerator } from '../../lib/world/world';
import type { Server } from '../../server';


export default class FlatGenerator implements IWorldGenerator {
	name: string = 'flat';
	chunkWitdh: number = 32;
	chunkHeight: number = 256;
	seed: number;
	blocks: any;
	biome: biome.BaseBiome;
	_server: Server;
	_lastWorkerUsed = 0;

	constructor(seed: number, server: Server) {
		this._server = server;
		
		this.seed = seed;
		this.blocks = server.registry.blockPalette;
		this.biome = new biome.BaseBiome(this.blocks, {}, seed);
	}

	getBlock(x: number, y: number, z: number, biomes): number {
		return y > 50 ? this.blocks.air : y == 50 ? this.blocks.grass : y > 45 ? this.blocks.dirt : y == 0 ? this.blocks.bedrock : this.blocks.stone;
	}

	getBiome(x: number, z: number): biome.BaseBiome {
		return this.biome;
	}

	getBiomesAt(x: number, z: number): { main: biome.BaseBiome; possible: { [index: string]: number }; height: number; size: number } {
		const possible = {};
		possible[this.biome.id] = 1;

		return {
			main: this.biome,
			possible,
			height: 60,
			size: 1,
		};
	}

	async generateBaseChunk(id: types.XZ, chunkignore: types.IView3duint16): Promise<types.IView3duint16> {
		const xoff = id[0] * this.chunkWitdh;
		const zoff = id[1] * this.chunkWitdh;

		let x: number, y: number, z: number;
		const chunk = new ndarray(new Uint16Array(this.chunkWitdh * this.chunkHeight * this.chunkWitdh), [this.chunkWitdh, this.chunkHeight, this.chunkWitdh])

		for (x = 0; x < this.chunkWitdh; x++) {
			for (z = 0; z < this.chunkWitdh; z++) {
				for (y = 0; y <= 70; y++) {
					chunk.set(x, y, z, this.getBlock(x + xoff, y, z + zoff, null));
				}
			}
		}

		return chunk;
	}

	async generateChunk(id: types.XZ, chunk: types.IView3duint16, world: World) {
	
	}
}

function delay(t) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve('');
		}, t);
	});
}
