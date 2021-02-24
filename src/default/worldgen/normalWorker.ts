import { makeNoise2D, makeNoise3D, Noise2D, Noise3D } from 'open-simplex-noise';
import hash from 'murmur-numbers';
import * as types from '../../types';
import * as biome from './parts/biomes';
import ndarray = require('ndarray');

import { expose } from 'threads/worker';

function getHighestBlock(chunk: types.IView3duint16, x: number, z: number) {
	for (let y = 256 - 1; y >= 0; y = y - 1) {
		const val = chunk.get(x, y, z);
		if (val != 0) return { level: y, block: val };
	}
	return null;
}

let generator: NormalGenerator;

const x = {
	setupGenerator(seed, blocks) {
		generator = new NormalGenerator(seed, blocks);
	},

	generateBaseChunk(id: types.XZ, chunk): Uint16Array {
		const data = generator.generateBaseChunk(id, chunk);
		return data.data;
	},

	getBiomesAt(x, z) {
		return generator.getBiomesAt(x, z);
	},
};

expose(x);

class NormalGenerator {
	chunkWitdh: number = 32;
	chunkHeight: number = 256;
	waterLevel: number = 65;
	seed: number;
	biomeNoise1: Noise2D;
	biomeNoise2: Noise2D;
	biomeNoise3: Noise2D;

	caveNoise1: Noise3D;
	caveNoise2: Noise3D;
	plantSeed: number;
	biomeSpacing: number = 100;
	blocks: any;
	biomes: any;
	hash: hash;
	features = {
		oakTree: -1,
		birchTree: -2,
		cactus: -3,
		spruceTree: -4,
		yellowOakTree: -5,
	};

	constructor(seed: number, blocks) {
		this.seed = seed;
		this.biomeNoise1 = makeNoise2D(Math.round(seed * Math.sin(seed ^ 3) * 10000));
		this.biomeNoise2 = makeNoise2D(Math.round(seed * Math.sin(seed ^ 4) * 10000));
		this.biomeNoise3 = makeNoise2D(Math.round(seed * Math.sin(seed ^ 5) * 10000));
		this.caveNoise1 = makeNoise3D(Math.round(seed * Math.cos(seed ^ 5) * 10000));
		this.caveNoise2 = makeNoise3D(Math.round(seed * Math.cos(seed ^ 2) * 10000));
		this.plantSeed = Math.round(seed * Math.sin(seed ^ 6) * 10000);
		this.blocks = blocks;
		this.hash = hash(this.plantSeed);

		this.biomes = {
			mountains: new biome.MountainsBiome(this.blocks, this.features, seed),
			plains: new biome.PlainsBiome(this.blocks, this.features, seed),
			desert: new biome.DesertBiome(this.blocks, this.features, seed),
			forest: new biome.ForestBiome(this.blocks, this.features, seed),
			iceplains: new biome.IcePlainsBiome(this.blocks, this.features, seed),
			icemountains: new biome.IceMountainsBiome(this.blocks, this.features, seed),
			ocean: new biome.OceanBiome(this.blocks, this.features, seed),
			beach: new biome.BeachBiome(this.blocks, this.features, seed),
			savanna: new biome.SavannaBiome(this.blocks, this.features, seed),
		};
	}

	getBlock(x: number, y: number, z: number, biomes): number {
		let value = 0;
		let key = '';

		for (key in biomes.possible) {
			value = value + this.biomes[key].getHeightMap(x, y, z) * biomes.possible[key];
		}
		value = value / biomes.size;

		return y <= value ? this.blocks.stone : y <= this.waterLevel ? this.blocks.water : 0;
	}

	getBiome(x: number, z: number): biome.BaseBiome {
		const rand = this.hash(200, x, z) / 90;
		const wierdness = this.biomeNoise1(x / 600, z / 600) + 1 + rand;
		const heat = this.biomeNoise2(x / 300, z / 300) + 1 + rand;
		const water = this.biomeNoise3(x / 400, z / 400) + 1 + rand;

		if (water > 1.3) return this.biomes.ocean;
		else if (water > 1.15) {
			if (wierdness > 1.5) return this.biomes.mountains;
			return this.biomes.beach;
		} else if (heat > 1.4) {
			return this.biomes.desert;
		} else if (heat > 0.5) {
			if (wierdness > 1.5) return this.biomes.mountains;
			else if (wierdness > 1.3) return this.biomes.forest;
			return this.biomes.plains;
		} else if (heat <= 0.6) {
			if (wierdness > 1.5) return this.biomes.icemountains;
			return this.biomes.iceplains;
		}
	}

	getBiomesAt(x: number, z: number): { main: biome.BaseBiome; possible: { [index: string]: number }; height: number; size: number } {
		const main = this.getBiome(x, z);

		let x1;
		let z1;

		const possible = {};
		let biome: biome.BaseBiome;
		let height: number = 0;
		let size = 0;

		for (x1 = -10; x1 <= 10; x1++) {
			for (z1 = -10; z1 <= 10; z1++) {
				if (dist2(x1, z1) > 10) continue;
				biome = this.getBiome(x + x1, z + z1);
				if (possible[biome.id] == undefined) possible[biome.id] = 0;
				possible[biome.id] = possible[biome.id] + 1;
				if (height < biome.height) height = biome.height;

				size = size + 1;
			}
		}

		return {
			main,
			possible,
			height,
			size,
		};
	}

	generateBaseChunk(id: types.XZ, chunk): types.IView3duint16 {
		const xoff = id[0] * this.chunkWitdh;
		const zoff = id[1] * this.chunkWitdh;

		let x: number, y: number, z: number;
		let biomes: { main: biome.BaseBiome; possible: { [index: string]: number }; height: number };
		let chunkTemp = new ndarray(new Uint16Array(this.chunkWitdh * this.chunkHeight * this.chunkWitdh), [
			this.chunkWitdh,
			this.chunkHeight,
			this.chunkWitdh,
		]);

		for (x = 0; x < this.chunkWitdh; x++) {
			for (z = 0; z < this.chunkWitdh; z++) {
				biomes = this.getBiomesAt(x + xoff, z + zoff);
				for (y = 0; y <= biomes.height; y++) {
					chunkTemp.set(x, y, z, this.getBlock(x + xoff, y, z + zoff, biomes));
				}
			}
		}

		return chunkTemp;
	}
}

function dist2(x: number, z: number): number {
	return Math.sqrt(x * x + z * z);
}

function delay(t) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve('');
		}, t);
	});
}
