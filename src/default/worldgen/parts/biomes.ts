import { Noise2D, Noise3D, makeNoise2D, makeNoise3D } from 'open-simplex-noise';
import hash from 'murmur-numbers';

export class BaseBiome {
	block: { [index: string]: number } = {};
	heightNoise: Noise2D;
	caveNoise: Noise3D;
	seed: number;
	hash: hash;
	hash2: hash;
	height: number = 100;
	feature: { [index: string]: number } = {};

	constructor(blocks, feature, seed: number) {
		this.block = blocks;
		this.feature = feature;
		this.heightNoise = makeNoise2D(Math.round(seed * 60 * Math.sin(seed ^ 3) * 10000));
		this.caveNoise = makeNoise3D(Math.round(seed * Math.sin(seed ^ 2) * 10000));
		this.hash = hash(seed ^ (2 * 10000));
		this.hash2 = hash(seed * 3 * 10000);
	}

	getBlock(x: number, y: number, z: number): number | string {
		if (this.getHeightMap(x, y, z)) {
			return this.block.stone;
		}
	}

	getHeightMap(x: number, y: number, z: number): boolean {
		const r = Math.floor(this.heightNoise(x / 140, z / 140) + 1) * 5 + 50;

		return y <= r ? true : false;
	}

	validate(x: number, z: number) {
		return true;
	}
}

export class PlainsBiome extends BaseBiome {
	height: number = 120;
	getBlock(x: number, y: number, z: number): number | string {
		const block = this.getHeightMap(x, y, z);
		const upBlock = this.getHeightMap(x, y + 1, z);
		const up3Block = this.getHeightMap(x, y + 3, z);
		const bottomBlock = this.getHeightMap(x, y - 1, z);

		if (y == 0) return this.block.bedrock;
		if (block) {
			if (!upBlock) return this.block.grass;
			else if (upBlock && !up3Block) return this.block.dirt;
			else return this.block.stone;
		} else if (bottomBlock) {
			if (this.hash2(x, z) >= 0.9995) return this.feature.oakTree;
			else if (this.hash2(x, z) <= 0.00005) return this.feature.birchTree;
			else if (this.hash(x, z) <= 0.06) return this.hash(x, y, z) <= 0.5 ? this.block.red_flower : this.block.yellow_flower;
			else if (this.hash(x, z) >= 0.85) return this.block.grass_plant;
		}

		return this.block.air;
	}

	getHeightMap(x: number, y: number, z: number): boolean {
		const dim = this.caveNoise(x / 70, y / 70, z / 70);
		const dim2 = this.caveNoise(x / 40, y / 40, z / 40);
		const layer1 = this.heightNoise(x / 120, z / 120);
		const layer2 = this.heightNoise(x / 10, z / 10);

		const h = layer1 + (layer2 + 1) / 4;

		const r = (dim * (1 - h) + dim2 * h) * 14 + 50;

		//lerp(noise1, noise2, clamp(noiseBlend * blendAmplitide)) * mainAmplitude

		//const r = (dim * (1 - layer1) + dim2 * layer1) * (60 * Math.abs(layer2)) + 50;
		//const r = Math.floor((dim + dim2 + layer1 + layer2 - 3) / 8) + 50
		//const r = Math.floor((dim * 30 + dim2 * 20 + layer1 * 20 + layer2 * 10 - 3) / 65) + 50

		return y <= r ? true : false;
	}
}

export class MountainsBiome extends BaseBiome {
	height: number = 180;
	getBlock(x: number, y: number, z: number): number | string {
		const block = this.getHeightMap(x, y, z);
		const upBlock = this.getHeightMap(x, y + 1, z);
		const up3Block = this.getHeightMap(x, y + 3, z);
		const bottomBlock = this.getHeightMap(x, y - 1, z);

		if (y == 0) return this.block.bedrock;
		if (block) {
			if (!upBlock) return this.block.grass;
			else if (upBlock && !up3Block) return this.block.dirt;
			else return this.block.stone;
		} else if (bottomBlock) {
			if (this.hash2(x, z) >= 0.9997) return this.feature.oakTree;
			else if (this.hash2(x, z) <= 0.00003) return this.feature.birchTree;
			else if (this.hash(x, z) <= 0.03) return this.hash(x, y, z) <= 0.5 ? this.block.red_flower : this.block.yellow_flower;
			else if (this.hash(x, z) >= 0.85) return this.block.grass_plant;
		}

		return this.block.air;
	}

	getHeightMap(x: number, y: number, z: number): boolean {
		const dim = this.caveNoise(x / 120, y / 120, z / 120);
		const dim2 = this.heightNoise(x / 80, z / 80);
		const h = this.heightNoise(x / 150, z / 150);

		const r = (-1 * Math.abs(dim * (1 - h) + dim2 * h) + 1) * 100 + 60;

		return y <= r ? true : false;
	}
}
