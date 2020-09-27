import { Noise2D, Noise3D, makeNoise2D, makeNoise3D } from 'open-simplex-noise';
import hash from 'murmur-numbers';

export class BaseBiome {
	id: string = 'base';
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

	getBlock(x: number, y: number, z: number, get: Function): number {
		if (get(x, y, z)) {
			return this.block.stone;
		}
	}

	getHeightMap(x: number, y: number, z: number): number {
		return Math.floor(this.heightNoise(x / 140, z / 140) + 1) * 5 + 50;
	}

	validate(x: number, z: number) {
		return true;
	}
}

export class PlainsBiome extends BaseBiome {
	id: string = 'plains';
	height: number = 120;
	getBlock(x: number, y: number, z: number, get: Function): number {
		const block = get(y);
		const upBlock = get(y + 1);
		const up3Block = get(y + 3);
		const bottomBlock = get(y - 1);

		if (y == 0) return this.block.bedrock;
		if (block == this.block.stone) {
			if (upBlock == 0) return this.block.grass;
			else if (upBlock == this.block.stone && up3Block != this.block.stone) return this.block.dirt;
			else return this.block.stone;
		} else if (bottomBlock) {
			if (this.hash2(x, z) >= 0.9995) return this.feature.oakTree;
			else if (this.hash2(x, z) <= 0.00005) return this.feature.birchTree;
			else if (this.hash(x, z) <= 0.06) return this.hash(x, y, z) <= 0.5 ? this.block.red_flower : this.block.yellow_flower;
			else if (this.hash(x, z) >= 0.85) return this.block.grass_plant;
		}

		return this.block.air;
	}

	getHeightMap(x: number, y: number, z: number): number {
		const dim = this.caveNoise(x / 70, y / 70, z / 70);
		const dim2 = this.caveNoise(x / 40, y / 40, z / 40);
		const layer1 = this.heightNoise(x / 120, z / 120) + 0.4;
		const layer2 = this.heightNoise(x / 10, z / 10);

		const h = layer1 + (layer2 + 1) / 4;

		//lerp(noise1, noise2, clamp(noiseBlend * blendAmplitide)) * mainAmplitude

		//const r = (dim * (1 - layer1) + dim2 * layer1) * (60 * Math.abs(layer2)) + 50;
		//const r = Math.floor((dim + dim2 + layer1 + layer2 - 3) / 8) + 50
		//const r = Math.floor((dim * 30 + dim2 * 20 + layer1 * 20 + layer2 * 10 - 3) / 65) + 50

		return (dim * (1 - h) + dim2 * h) * 14 + 70;
	}
}

export class ForestBiome extends BaseBiome {
	id: string = 'forest';
	height: number = 120;
	mountainNoise: Noise2D;
	constructor(blocks, feature, seed) {
		super(blocks, feature, seed);
		this.mountainNoise = makeNoise2D(seed * 5238 + 132);
	}
	getBlock(x: number, y: number, z: number, get: Function): number {
		const block = get(y);
		const upBlock = get(y + 1);
		const up3Block = get(y + 3);
		const bottomBlock = get(y - 1);

		if (y == 0) return this.block.bedrock;
		if (block == this.block.stone) {
			if (upBlock == 0) return this.block.grass;
			else if (upBlock == this.block.stone && up3Block != this.block.stone) return this.block.dirt;
			else return this.block.stone;
		} else if (bottomBlock) {
			if (this.hash2(x, z) >= 0.993) return this.feature.oakTree;
			else if (this.hash2(x, z) <= 0.002) return this.feature.birchTree;
			else if (this.hash(x, z) <= 0.06) return this.hash(x, y, z) <= 0.5 ? this.block.red_flower : this.block.yellow_flower;
			else if (this.hash(x, z) >= 0.85) return this.block.grass_plant;
		}

		return this.block.air;
	}

	getHeightMap(x: number, y: number, z: number): number {
		const dim = this.caveNoise(x / 70, y / 70, z / 70);
		const dim2 = this.caveNoise(x / 40, y / 40, z / 40);
		const layer1 = this.heightNoise(x / 120, z / 120);
		const layer2 = this.heightNoise(x / 10, z / 10);
		const mountain = this.mountainNoise(x / 60, z / 60) + 1;

		const h = layer1 + (layer2 + 1) / 4;

		return (dim * (1 - h) + dim2 * h) * (14 + mountain * 10) + 72;
	}
}

export class DesertBiome extends BaseBiome {
	id: string = 'desert';
	height: number = 120;
	getBlock(x: number, y: number, z: number, get: Function): number {
		const block = get(y);
		const upBlock = get(y + 1);
		const up3Block = get(y + 3);
		const bottomBlock = get(y - 1);

		if (y == 0) return this.block.bedrock;
		else if (block == this.block.stone) {
			if (!upBlock) return this.block.sand;
			else if (upBlock && !up3Block) return this.block.sand;
			else return this.block.stone;
		} else if (bottomBlock) {
			if (this.hash2(x, z) <= 0.01) return this.feature.cactus;
			else if (this.hash(x, z) <= 0.006) return this.block.deadbush;
		}

		return this.block.air;
	}

	getHeightMap(x: number, y: number, z: number): number {
		const dim = this.caveNoise(x / 70, y / 70, z / 70);
		const dim2 = this.caveNoise(x / 40, y / 40, z / 40);
		const layer1 = this.heightNoise(x / 120, z / 120);

		return Math.abs(dim * (1 - layer1) + dim2 * layer1) * 24 + 73;
	}
}

export class MountainsBiome extends BaseBiome {
	id: string = 'mountains';
	height: number = 240;
	hightVariationNoise: Noise2D;
	constructor(blocks, feature, seed) {
		super(blocks, feature, seed);
		this.hightVariationNoise = makeNoise2D(seed ^ (2 + 1));
	}
	getBlock(x: number, y: number, z: number, get: Function): number {
		const block = get(y);
		const upBlock = get(y + 1);
		const up2Block = get(y + 2);
		const up3Block = get(y + 3);
		const bottomBlock = get(y - 1);

		if (y == 0) return this.block.bedrock;
		if (block == this.block.stone) {
			if (y > 135 + this.hash(x, z) * 6) {
				if (upBlock == 0 || (upBlock == this.block.stone && up2Block == 0)) return this.block.snow;
			} else if (y > 115 + this.hash(x, z) * 7) {
				if (upBlock == 0) return this.block.stone;
			} else if (upBlock == 0) return this.block.grass;
			else if (upBlock == this.block.stone && up3Block != this.block.stone) return this.block.dirt;
			return this.block.stone;
		} else if (bottomBlock) {
			if (y > 120) return this.block.air;
			if (this.hash(x, z) <= 0.03) return this.hash(x, y, z) <= 0.5 ? this.block.red_flower : this.block.yellow_flower;
			else if (this.hash(x, z) >= 0.85) return this.block.grass_plant;
		}

		return this.block.air;
	}

	getHeightMap(x: number, y: number, z: number): number {
		const dim = this.caveNoise(x / 180, y / 80, z / 180);
		const dim2 = this.caveNoise(x / 20, y / 20, z / 20);
		const mountaines = Math.abs(this.heightNoise(x / 80, z / 80));

		return  minNegative(mountaines - (dim * dim2)/2) * 100 + 80;
	}
}


function minNegative(x: number): number {
	return x > 0 ? x : x / 3
}