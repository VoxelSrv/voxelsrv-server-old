import * as values from './values';

// Redirects

import * as libcommands from './lib/commands';
export const commands = {
	register: libcommands.register,
	execute: libcommands.execute,
	event: libcommands.event,
};

import * as libentity from './lib/entity';
export const entities = {
	create: libentity.create,
	recreate: libentity.recreate,
	get: libentity.get,
	getAll: libentity.getAll,
};

import * as libprotocol from './lib/protocol';
import * as prothelper from './lib/protocol-helper';
export const protocol = {
	server: prothelper.wss,
	sendAll: prothelper.broadcast,
	broadcast: prothelper.broadcast,
	...libprotocol,
};

import * as libregistry from './lib/registry';
export const registry = {
	addItem: libregistry.addItem,
	addBlock: libregistry.addBlock,
	itemRegistry: libregistry.itemRegistry,
	blockRegistry: libregistry.blockRegistry,
	Block: libregistry.Block,
	ItemBlock: libregistry.ItemBlock,
	Item: libregistry.Item,
	ItemTool: libregistry.ItemTool,
	ItemArmor: libregistry.ItemArmor,
	ItemStack: libregistry.ItemStack,
	event: libregistry.event,
};

import * as libplugins from './lib/plugins';
export const plugins = {
	list: libplugins.plugins,
};

import * as libplayer from './lib/player';
export const players = {
	get: libplayer.get,
	getAll: libplayer.getAll,
	event: libplayer.event,
};

import * as libchat from './lib/chat';
export const chat = {
	ChatComponent: libchat.ChatComponent,
	convertOld: libchat.convertOldFormat,
	validate: libchat.validate,
	sendMlt: libchat.sendMlt,
};

export * as console from './lib/console';
export * as inventories from './lib/inventory';
export * as worlds from './lib/worlds';
export * as values from './values';

export const version = values.serverVersion;
