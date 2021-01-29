import * as fs from 'fs';

import * as types from '../../types';
import type { Server } from '../../server';
import { World } from './world';

import type { ICoreWorldManager, ICoreWorldGenerator } from 'voxelservercore/interfaces/world';
import { Entity, EntityData } from './entity';
import { v4 as uuid } from 'uuid';


export class WorldManager implements ICoreWorldManager {
	readonly chunkWitdh = 32;
	readonly chunkHeight = 256;

	readonly lastChunk = 5000;

	worlds: { [index: string]: World } = {};
	worldGenerator: { [index: string]: IWorldGeneratorConstructor } = {};

	readonly _baseMetadata = { ver: 2, stage: 0 };

	_server: Server;

	constructor(server) {
		this._server = server;
	}

	create(name: string, seed: number, generator: string): World | null {
		if (this.exist(name) == false && this.worlds[name] == undefined) {
			this.worlds[name] = new World(name, seed, generator, null, this._server);
			return this.worlds[name];
		} else {
			return null;
		}
	}

	load(name: string): World | null {
		try {
			if (this.exist(name) == true && this.worlds[name] == undefined) {
				const readed = fs.readFileSync('./worlds/' + name + '/world.json');
				const data = JSON.parse(readed.toString());
				this.worlds[name] = new World(name, data.seed, data.generator, data.version, this._server);

				return this.worlds[name];
			} else {
				return null;
			}
		} catch (e) {
			this._server.log.error(`Can't load world ${name}! Trying to recreate it...`);
			this.create(name, 0, 'normal');
		}
	}

	unload(name: string): void {
		this.worlds[name].unload();
		this._server.log.normal('Unloaded world ' + name);
	}

	exist(name: string): boolean {
		return fs.existsSync('./worlds/' + name);
	}

	get(name: string): World | undefined {
		return this.worlds[name];
	}

	addGenerator(name: string, gen: any) {
		this.worldGenerator[name] = gen;
	}
}

export interface IWorldGenerator extends ICoreWorldGenerator {
	getBlock(x: number, y: number, z: number, biomes): number;
	getBiome(x: number, z: number);
	getBiomesAt(x: number, z: number): { main; possible: { [index: string]: number }; height: number; size: number };
	generateBaseChunk(id: types.XZ, chunk: types.IView3duint16): Promise<types.IView3duint16>;
	generateChunk(id: types.XZ, chunk: types.IView3duint16, world: World): Promise<void>;
}


interface IWorldGeneratorConstructor {
	new (seed: number, server: Server): IWorldGenerator;
}


export class EntityManager {
	_worlds: WorldManager;
	_server: Server;

	constructor(server: Server) {
		this._server = server;
		this._worlds = server.worlds;
	}

	create(type: string, data: EntityData, worldName: string, tick: Function | null): Entity {
		let id = uuid();

		this._worlds.get(worldName).entities[id] = new Entity(id, type, data, this._worlds.get(worldName), tick, this);

		this._server.emit('entity-create', {
			uuid: id,
			entity: this._worlds.get(worldName).entities[id],
		});

		return this._worlds.get(worldName).entities[id];
	}

	recreate(id: string, type: string, data: EntityData, worldName: string, tick: Function | null): Entity {
		this._worlds.get(worldName).entities[id] = new Entity(id, type, data, this._worlds.get(worldName), tick, this);

		this._server.emit('entity-create', {
			uuid: id,
			entity: this._worlds.get(worldName).entities[id],
		});

		return this._worlds.get(worldName).entities[id];
	}

	get(world, id) {
		if (!this._worlds.get(world)) return null;
		return this._worlds.get(world).entities[id];
	}
	getAll(world) {
		if (!this._worlds.get(world)) return null;
		return this._worlds.get(world).entities;
	}
}
