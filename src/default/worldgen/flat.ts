import { blockPalette as block } from '../../lib/registry';

export default class flatGenerator {
	chunkWitdh = 32;
	chunkHeight = 256;
	seed: number;

	constructor(seed) {

		this.seed = seed;
	}

	getBlock(x, y, z) {
		if (y == 0) return block.bedrock;
		else if (y == 40) return block.grass;
		else if (35 < y && y < 40) return block.dirt;
		else if (y <= 35) return block.stone;
		else return 0;
	}

	async generateChunk(id, chunk) {
		for (var x = 0; x < this.chunkWitdh; x++) {
			for (var z = 0; z < this.chunkWitdh; z++) {
				for (var y = 0; y < 45; y++) {
					var block = this.getBlock(x + id[0] * this.chunkWitdh, y, z + id[1] * this.chunkWitdh);
					if (block != 0) chunk.set(x, y, z, block);
				}
			}
		}
		return chunk;
	}

	getHeightMap() {
		return 40;
	}

	getBiome() {
		return 'plants';
	}
};
