import * as fs from 'fs';

export const plugins: {} = {};

export interface IPlugin {
	name: string;
	version: string;
	api: string;
	[index: string]: any;
}

export function loadPlugins() {
	const pluginFiles = fs.readdirSync('./plugins');

	for (const file of pluginFiles) {
		try {
			let plugin: IPlugin;
			if (file.endsWith('.ts') || file.endsWith('.js')) plugin = require(`../../plugins/${file}`);
			else plugin = require(`../../plugins/${file}/`);
			plugins[plugin.name] = plugin;
		} catch (e) {
			console.error(`Can't load plugin ${file}! Reason: ` + e);
		}
	}
}
