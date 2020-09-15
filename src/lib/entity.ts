import { EventEmitter } from 'events';
import * as vec from 'gl-vec3';

import * as worldManager from './worlds';
import * as types from '../types';
import { ArmorInventory } from './inventory';

import { v4 as uuid } from 'uuid';
import { entities } from 'server';

export const event = new EventEmitter();

export function create(type: string, data: EntityData, worldName: string, tick: Function | null): Entity {
	let id = uuid();

	worldManager.get(worldName).entities[id] = new Entity(id, type, data, worldName, tick);

	event.emit('entity-create', {
		uuid: id,
		data: JSON.stringify(worldManager.get(worldName).entities[id].data),
	});

	return worldManager.get(worldName).entities[id];
}

export function recreate(id: string, type: string, data: EntityData, worldName: string, tick: Function | null): Entity {
	worldManager.get(worldName).entities[id] = new Entity(id, type, data, worldName, tick);

	event.emit('entity-create', {
		uuid: id,
		data: JSON.stringify(worldManager.get(worldName).entities[id].data),
	});

	return worldManager.get(worldName).entities[id];
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
	armor?: ArmorInventory;
	[index: string]: any;
}

export interface IEntity {
	data: EntityData;
	readonly id: string;
	world: worldManager.World;
	chunkID: types.XZ;
	chunk: worldManager.Chunk;
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
	world: worldManager.World;
	chunkID: types.XZ;
	chunk: worldManager.Chunk;
	tick: Function | null;
	readonly type: string;

	constructor(id: string, type: string, data: EntityData, world: string, tick: Function | null) {
		this.data = data;
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
		this.world = worldManager.get(world);
		this.chunkID = worldManager.toChunk(this.data.position).id;
		this.chunk = this.world.chunks[this.chunkID.toString()];
		if (tick != null) this.tick = tick;
		else this.tick = function () {};
	}

	getObject(): IEntityObject {
		return {
			data: this.data,
			id: this.id,
			world: this.world.name,
			type: this.type,
			chunk: this.chunkID,
		};
	}

	teleport(pos: types.XYZ, eworld: string | worldManager.World): void {
		this.world = typeof eworld == 'string' ? worldManager.get(eworld) : eworld;
		this.data.position = pos;
		this.chunkID = worldManager.toChunk(pos).id;
		this.chunk = this.world.chunks[this.chunkID.toString()];
		event.emit('entity-move', {
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
		this.chunkID = worldManager.toChunk(pos).id;
		this.chunk = this.world.chunks[this.chunkID.toString()];

		event.emit('entity-move', {
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
		event.emit('entity-move', {
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
			event.emit('entity-remove', { uuid: this.id });

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

	getEntitiesInRadius(radius: number): { uuid: string; entity: Entity; distance: number }[] {
		const array: { uuid: string; entity: Entity; distance: number }[] = [];
		for (const uuid in entities) {
			const distance = vec.distance(this.data.position, entities[uuid].data.position);
			if (distance <= radius) array.push({ uuid, entity: entities[uuid], distance });
		}
		return array;
	}
}

export function get(world, id) {
	if (!worldManager.get(world)) return null;
	return worldManager.get(world).entities[id];
}
export function getAll(world) {
	if (!worldManager.get(world)) return null;
	return worldManager.get(world).entities;
}
