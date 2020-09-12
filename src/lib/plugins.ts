import * as fs from 'fs';
import * as semver from 'semver';

import * as console from './console';
import { ChatComponent } from './chat'

import { serverVersion } from '../values';

export const plugins: {} = {};

export interface IPlugin {
	name: string;
	version: string;
	supported: string;
	[index: string]: any;
}

export async function loadPlugins() {
	const pluginFiles = fs.readdirSync('./plugins');

	for (const file of pluginFiles) {
		try {
			let plugin: IPlugin;
			if (file.endsWith('.ts') || file.endsWith('.js')) plugin = await import(`../../plugins/${file}`);
			else if (fs.existsSync(`./plugins/${file}/index.ts`) || fs.existsSync(`./plugins/${file}/index.js`)) plugin = await import(`../../plugins/${file}/`);
			else continue;
			if (!semver.satisfies(serverVersion, plugin.supported)) {
				console.warn([new ChatComponent('Plugin ', 'orange'), new ChatComponent(file, 'yellow'),  new ChatComponent(' might not support this version of server!', 'orange')]);
				const min = semver.minVersion(plugin.supported);
				const max = semver.maxSatisfying(plugin.supported);
				if (!!min && !!max && (semver.gt(serverVersion, max) || semver.lt(serverVersion, min)))
					console.warn(`It only support versions from ${min} to ${max}.`);
				else if (!!min && !max && semver.lt(serverVersion, min)) console.warn(`It only support versions ${min} or newer.`);
				else if (!min && !!max && semver.gt(serverVersion, max)) console.warn(`It only support versions ${max} or older.`);
			}

			plugins[plugin.name] = plugin;
		} catch (e) {
			console.error(`Can't load plugin ${file}!`);
			console.obj(e)
		}
	}
}
