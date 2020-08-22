import * as fs from 'fs';
import * as semver from 'semver';

import * as console from './console';

import { serverVersion } from '../values';

export const plugins: {} = {};

export interface IPlugin {
	name: string;
	version: string;
	supported: string;
	[index: string]: any;
}

export function loadPlugins() {
	const pluginFiles = fs.readdirSync('./plugins');

	for (const file of pluginFiles) {
		try {
			let plugin: IPlugin;
			if (file.endsWith('.ts') || file.endsWith('.js')) plugin = require(`../../plugins/${file}`);
			else plugin = require(`../../plugins/${file}/`);
			if (!semver.satisfies(serverVersion, plugin.supported)) {
				console.warn(`Plugin ${file} might not support this version of server!`);
				const min = semver.minVersion(plugin.supported);
				const max = semver.maxSatisfying(plugin.supported);
				if (!!min && !!max && (semver.gt(serverVersion, max) || semver.lt(serverVersion, min)))
					console.warn(`It only support versions from ${min} to ${max}.`);
				else if (!!min && !max && semver.lt(serverVersion, min)) console.warn(`It only support versions ${min} or newer.`);
				else if (!min && !!max && semver.gt(serverVersion, max)) console.warn(`It only support versions ${max} or older.`);
			}

			plugins[plugin.name] = plugin;
		} catch (e) {
			console.error(`Can't load plugin ${file}! Reason: ` + e);
		}
	}
}
