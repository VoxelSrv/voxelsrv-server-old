import { makeNoise2D, makeNoise3D, Noise2D, Noise3D } from 'open-simplex-noise';
import * as tree from './parts/tree';
import hash from 'murmur-numbers';
import { blockPalette } from '../../lib/registry';
import * as types from '../../types';
import * as biome from './parts/biomes';

function getHighestBlock(chunk: types.IView3duint16, x: number, z: number) {
	for (let y = 256 - 1; y >= 0; y = y - 1) {
		const val = chunk.get(x, y, z);
		if (val != 0) return { level: y, block: val };
	}
	return null;
}

export default class normalGenerator {
	name: string = 'normal';
	chunkWitdh: number = 32;
	chunkHeight: number = 256;
	waterLevel: number = 60;
	seed: number;
	biomeNoise1: Noise2D;
	biomeNoise2: Noise2D;
	biomeNoise3: Noise2D;
	plantSeed: number;
	biomeSpacing: number = 100;
	blocks: any;
	biomes: any;
	hash: hash;
	features = {
		oakTree: -1,
		birchTree: -2,
	};

	constructor(seed: number) {
		this.seed = seed;
		this.biomeNoise1 = makeNoise2D(Math.round(seed * Math.sin(seed ^ 3) * 10000));
		this.biomeNoise2 = makeNoise2D(Math.round(seed * Math.sin(seed ^ 4) * 10000));
		this.biomeNoise3 = makeNoise2D(Math.round(seed * Math.sin(seed ^ 5) * 10000));
		this.plantSeed = Math.round(seed * Math.sin(seed ^ 6) * 10000);
		this.blocks = blockPalette;
		this.hash = hash(this.plantSeed);

		this.biomes = {
			mountains: new biome.MountainsBiome(this.blocks, this.features, seed),
			plains: new biome.PlainsBiome(this.blocks, this.features, seed),
		};
	}

	getBlock(x: number, y: number, z: number, biome: string): number {
		return this.biomes[biome].getBlock(x, y, z);
	}

	async generateChunk(id: types.XZ, chunk: types.IView3duint16): Promise<types.IView3duint16> {
		const xoff = id[0] * this.chunkWitdh;
		const zoff = id[1] * this.chunkWitdh;

		let x: number, y: number, z: number;
		let block: number;
		let biome: string;

		for (x = 0; x < this.chunkWitdh; x++) {
			for (z = 0; z < this.chunkWitdh; z++) {
				biome = 'mountains';
				for (y = 0; y <= this.biomes[biome].height; y++) {
					block = this.getBlock(x + xoff, y, z + zoff, biome);
					if (block < 0) {
						let gen = null;
						if (block == this.features.oakTree) gen = tree.oakTree(hash(x + xoff, z + zoff) * 1000, this.hash, this.blocks);
						else if (block == this.features.birchTree) gen = tree.birchTree(hash(x + xoff, z + zoff) * 1000, this.hash, this.blocks);
						pasteStructure(chunk, gen, x, y, z);
					} else if (!!block) chunk.set(x, y, z, block);
				}
			}
		}

		return chunk;
	}
}

function pasteStructure(chunk: types.IView3duint16, gen: types.IView3duint16, x: number, y: number, z: number) {
	const xm = Math.round(gen.shape[0] / 2);
	const zm = Math.round(gen.shape[2] / 2);
	for (var i = 0; i < gen.shape[0]; i++) {
		for (var j = 0; j < gen.shape[1]; j++) {
			for (var k = 0; k < gen.shape[2]; k++) {
				if (gen.get(i, j, k) != 0) {
					chunk.set(x - xm + i, y + j, z - zm + k, gen.get(i, j, k));
				}
			}
		}
	}
}
