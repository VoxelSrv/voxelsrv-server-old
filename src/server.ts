import { EventEmitter } from 'events';
import * as fs from 'fs';

import * as registry from './lib/registry';
import * as console from './lib/console';
import * as worldManager from './lib/worlds';
import * as permissions from './lib/permissions';
import * as configs from './lib/configs';
import { setupConnectionHandler } from './lib/connection';
import startHeartbeat from './lib/heartbeat';
import { loadPlugins } from './lib/plugins';

import normalGenerator from './default/worldgen/normal';
import flatGenerator from './default/worldgen/flat';

import { serverVersion, serverProtocol, serverConfig, setConfig } from './values';

export async function startServer(wss: any) {
	const event = new EventEmitter();

	console.log(`^yStarting VoxelSRV server version^: ${serverVersion} ^y[Protocol:^: ${serverProtocol}^y]`);
	['./plugins', './players', './worlds', './config', './storage'].forEach((element) => {
		if (!fs.existsSync(element)) {
			try {
				fs.mkdirSync(element);
				console.log(`^BCreated missing directory: ^w${element}`);
			} catch (e) {
				console.log(`^rCan't create directory: ^w${element}! Reason: ${e}`);
				process.exit();
			}
		}
	});


	const config = configs.load('', 'config');
	setConfig(config);

	permissions.loadGroups(configs.load('', 'permissions'));
	configs.save('', 'config', serverConfig);
	
	event.emit('config-update', config);

	await loadPlugins();

	registry.loadPalette();

	await import('./default/blocks');
	await import('./default/items');

	registry.event.emit('registry-define');

	registry.finalize();

	worldManager.addGenerator('normal', normalGenerator);
	worldManager.addGenerator('flat', flatGenerator);

	if (worldManager.exist('default') == false) worldManager.create('default', serverConfig.world.seed, serverConfig.world.generator);
	else worldManager.load('default');

	if (serverConfig.public) startHeartbeat();

	await import('./default/commands');

	import('./lib/console-exec');

	console.log('^yServer started on port: ^:' + serverConfig.port);

	setupConnectionHandler(wss);
}
