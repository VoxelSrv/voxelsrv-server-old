import { makeNoise2D, makeNoise3D, Noise2D, Noise3D } from 'open-simplex-noise';
import tree from './parts/tree';
import hash from 'murmur-numbers';
import { blockPalette } from '../../lib/registry';
import * as types from '../../types';

function getHighestBlock(chunk: types.IView3duint16, x: number, z: number) {
	for (let y = 256 - 1; y >= 0; y = y - 1) {
		const val = chunk.get(x, y, z);
		if (val != 0) return { level: y, block: val };
	}
	return null;
}

export default class normal {
	name: string = 'normal';
	chunkWitdh: number = 32;
	chunkHeight: number = 256;
	waterLevel: number = 60;
	seed: number;
	heightNoise: Noise2D;
	caveNoise: Noise3D;
	biomeNoise1: Noise2D;
	biomeNoise2: Noise2D;
	biomeNoise3: Noise2D;
	plantSeed: number;
	biomeSpacing: number = 100;
	blocks: any;

	constructor(seed: number) {
		this.seed = seed;
		this.heightNoise = makeNoise2D(Math.round(seed * Math.sin(seed ^ 1) * 10000));
		this.caveNoise = makeNoise3D(Math.round(seed * Math.sin(seed ^ 2) * 10000));
		this.biomeNoise1 = makeNoise2D(Math.round(seed * Math.sin(seed ^ 3) * 10000));
		this.biomeNoise2 = makeNoise2D(Math.round(seed * Math.sin(seed ^ 4) * 10000));
		this.biomeNoise3 = makeNoise2D(Math.round(seed * Math.sin(seed ^ 5) * 10000));
		this.plantSeed = Math.round(seed * Math.sin(seed ^ 6) * 10000);
		this.blocks = blockPalette;
	}

	getBlock(x: number, y: number, z: number): number {
		const m = this.biomeNoise2(x / 180, z / 180);
		const r = this.getHeightMap(x, y, z, m);
		if (y == 0) return this.blocks.bedrock;
		else if (y <= r) return this.blocks.stone;
		else if (y <= this.waterLevel) return this.blocks.water;
		else return 0;
	}

	getHeightMap(x, y, z, mountaines) {
		const dim = (this.caveNoise(x / 180, y / 180, z / 180) + 0.3) * 140;
		const dim2 = this.caveNoise(x / 20, y / 20, z / 20) * 50;
		const layer1 = this.heightNoise(x / 140, z / 140) * mountaines * 20;
		const layer2 = this.heightNoise(x / 40, z / 40) * 20;

		return Math.floor((dim * 30 + dim2 * 20 + layer1 * 20 + layer2 * 10 - 3) / 65) + 50;
	}

	getBiome(x: number, z: number, temp: number, biomerng: number): string {
		if (0.2 < temp && biomerng == 1) return 'desert';
		else if (-1 < temp && temp < -0.2 && biomerng == 1) return 'iceland';
		else if (-0.3 < temp && temp < 0.3 && biomerng == 2) return 'forest';
		else return 'plants';
	}

	async generateChunk(id: types.XZ, chunk: types.IView3duint16): Promise<types.IView3duint16> {
		const xoff = id[0] * this.chunkWitdh;
		const zoff = id[1] * this.chunkWitdh;

		for (let x = 0; x < this.chunkWitdh; x++) {
			for (let z = 0; z < this.chunkWitdh; z++) {
				for (let y = 0; y <= 150; y++) {
					const block = this.getBlock(x + xoff, y, z + zoff);
					const blockup1 = this.getBlock(x + xoff, y + 1, z + zoff);
					const blockup3 = this.getBlock(x + xoff, y + 3, z + zoff);

					const biome = 'plants';
					if (block != 0) {
						if (40 < y && block == 1 && blockup1 == 0) {
							if (biome == 'plants' || biome == 'forest') chunk.set(x, y, z, this.blocks.grass);
							else if (biome == 'iceland') chunk.set(x, y, z, this.blocks.grass_snow);
							else if (biome == 'desert') chunk.set(x, y, z, this.blocks.sand);
						} else if (blockup1 != 0 && block != this.blocks.water && blockup3 == 0) {
							if (biome == 'plants' || biome == 'forest' || biome == 'iceland') chunk.set(x, y, z, this.blocks.dirt);
							else if (biome == 'desert') chunk.set(x, y, z, this.blocks.sand);
						} else if (blockup1 == this.blocks.water && block != 0 && block != this.blocks.water) {
							chunk.set(x, y, z, this.blocks.gravel);
						} else {
							chunk.set(x, y, z, block);
						}
					}
				}
			}
		}

		for (let x = 0; x < chunk.shape[0]; x++) {
			for (let z = 0; z < chunk.shape[2]; z++) {
				if (hash(x + xoff, z + zoff, this.plantSeed) < 0.1) {
					var high = { ...getHighestBlock(chunk, x, z) };
					if (high.block == this.blocks.grass) {
						chunk.set(x, high.level + 1, z, this.blocks.grass_plant);
					}
				} else if (hash(x + xoff, z + zoff, this.plantSeed * 2) < 0.1) {
					var high = { ...getHighestBlock(chunk, x, z) };
					if (high.block == this.blocks.grass) {
						chunk.set(
							x,
							high.level + 1,
							z,
							hash(x + xoff, high.level + 1, z + zoff, this.plantSeed) <= 0.5 ? this.blocks.red_flower : this.blocks.yellow_flower
						);
					}
				} else if (5 < x && x < 17 && 5 < z && z < 17) {
					//Temp
					if (hash(x + xoff, z + zoff, this.seed) < 0.02) {
						var high = { ...getHighestBlock(chunk, x, z) };
						if (high.block == this.blocks.grass) {
							var gen = tree.oakTree(hash(x + xoff, z + zoff, this.seed) * 1000);
							this.pasteStructure(chunk, gen, x, high.level + 1, z);
						}
					} else if (hash(x + xoff, z + zoff, this.seed * 5) < 0.007) {
						var high = { ...getHighestBlock(chunk, x, z) };
						if (high.block == this.blocks.grass) {
							var gen = tree.birchTree(hash(x + xoff, z + zoff, this.seed) * 5834);
							this.pasteStructure(chunk, gen, x, high.level + 1, z);
						}
					}
				}
			}
		}

		return chunk;
	}

	pasteStructure(chunk: types.IView3duint16, gen: types.IView3duint16, x: number, y: number, z: number) {
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
}
