import * as vec from 'gl-vec3';

import type { WorldManager, World, Chunk } from './worlds';
import type { Server } from '../server';
import * as types from '../types';
import { ArmorInventory } from './inventory';
import { globalToChunk } from './worlds';

import { v4 as uuid } from 'uuid';

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

export interface EntityData {
	position: types.XYZ;
	rotation: number;
	pitch: number;
	health: number;
	maxHealth: number;
	model: string;
	texture: string;
	name: string;
	nametag: boolean;
	hitbox: types.XYZ;
	armor?: ArmorInventory | any;
	[index: string]: any;
}

export interface IEntity {
	data: EntityData;
	readonly id: string;
	world: World;
	chunkID: types.XZ;
	chunk: Chunk;
	tick: Function | null;
	readonly type: string;
}

export interface IEntityObject {
	data: EntityData;
	readonly id: string;
	world: string;
	chunk: types.XZ;
	readonly type: string;
}

export class Entity implements IEntity {
	data: EntityData;
	readonly id: string;
	world: World;
	chunkID: types.XZ;
	chunk: Chunk;
	tick: Function | null;
	readonly type: string;

	_entities: EntityManager;

	constructor(id: string, type: string, data: EntityData, world: World, tick: Function | null, entitymanager: EntityManager) {
		this.data = data;
		this._entities = entitymanager;
		if (data.position == undefined) {
			this.data.position = [0, 0, 0];
		}
		if (data.rotation == undefined) {
			this.data.rotation = 0;
		}
		if (data.pitch == undefined) {
			this.data.pitch = 0;
		}
		this.type = type;
		this.id = id;
		this.world = world;
		this.chunkID = globalToChunk(this.data.position).id;
		this.chunk = this.world.chunks[this.chunkID.toString()];
		if (tick != null) this.tick = tick;
		else this.tick = function () {};
	}

	getObject(): IEntityObject {
		return {
			data: {
				position: this.data.position,
				rotation: this.data.rotation,
				pitch: this.data.pitch,
				health: this.data.health,
				maxHealth: this.data.maxHealth,
				model: this.data.model,
				texture: this.data.texture,
				name: this.data.name,
				nametag: this.data.nametag,
				hitbox: this.data.hitbox,
				armor: this.data.armor.getObject()
			},
			id: this.id,
			world: this.world.name,
			type: this.type,
			chunk: this.chunkID,
		};
	}

	teleport(pos: types.XYZ, eworld: World | string): void {
		this.world = typeof eworld == 'string' ? this._entities._worlds.get(eworld) : eworld;
		this.data.position = pos;
		this.chunkID = globalToChunk(pos).id;
		this.chunk = this.world.chunks[this.chunkID.toString()];
		this.world._server.emit('entity-move', {
			uuid: this.id,
			x: this.data.position[0],
			y: this.data.position[1],
			z: this.data.position[2],
			rotation: this.data.rotation,
			pitch: this.data.pitch,
		});
	}

	move(pos: types.XYZ): void {
		this.data.position = pos;
		this.chunkID = globalToChunk(pos).id;
		this.chunk = this.world.chunks[this.chunkID.toString()];

		this.world._server.emit('entity-move', {
			uuid: this.id,
			x: this.data.position[0],
			y: this.data.position[1],
			z: this.data.position[2],
			rotation: this.data.rotation,
			pitch: this.data.pitch,
		});
	}

	rotate(rot: number, pitch: number): void {
		this.data.rotation = rot;
		this.data.pitch = pitch;
		this.world._server.emit('entity-move', {
			uuid: this.id,
			x: this.data.position[0],
			y: this.data.position[1],
			z: this.data.position[2],
			rotation: this.data.rotation,
			pitch: this.data.pitch,
		});
	}

	remove(): void {
		try {
			let id = this.id;
			this.world._server.emit('entity-remove', { uuid: this.id });

			setTimeout(() => {
				if (this.world.entities[id] != undefined) delete this.world.entities[id];
			}, 10);
		} catch (e) {
			console.log("Server tried to remove entity, but it didn't work! Error: ", e);
		}
	}

	getID(): string {
		return this.id;
	}

	/*getEntitiesInRadius(radius: number): { uuid: string; entity: Entity; distance: number }[] {
		const array: { uuid: string; entity: Entity; distance: number }[] = [];
		for (const uuid in entities) {
			const distance = vec.dist(this.data.position, entities[uuid].data.position);
			if (distance <= radius) array.push({ uuid, entity: entities[uuid], distance });
		}
		return array;
	}*/
}
