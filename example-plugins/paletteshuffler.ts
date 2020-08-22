export const name = 'PaletteShuffler';
export const version = '0.0.1';
export const supported = '>=0.2.0-alpha';

import { registry, console } from '../';

let enabled = false;

registry.event.on('palette-loaded', (json) => shuffle(json));

function shuffle(json) {
	if (!enabled) {
		console.warn(
			`Warning! PaletteShuffler (${__filename.replace(__dirname, './plugins')}) will corrupt your world data! You should remove it.`,
			'If you want to use it anyway, change value of ^wenabled^R to true.'
		);
		return;
	}
	function rn(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}

	const usedBlocks = [];
	const palette = {};

	const ids = Object.values(json);
	const blocks = Object.keys(json);

	const obj = {};

	blocks.forEach((b) => {
		obj[b] = true;
	});

	ids.forEach((id) => {
		let x = true;

		while (x) {
			const blocksx = Object.keys(obj);

			const block = blocksx[rn(0, blocksx.length - 1)];
			delete obj[block];

			if (!usedBlocks.includes(block)) {
				usedBlocks.push(block);
				json[block] = id;
				x = false;
			}
		}
	});

	console.log('^GPalette shuffled. Check new look of your world :D');
}
