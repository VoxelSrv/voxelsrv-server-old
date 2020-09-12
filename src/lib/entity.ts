import { EventEmitter } from 'events';

import * as worldManager from './worlds';
import * as types from '../types';
import { ArmorInventory } from './inventory';

import { v4 as uuid } from 'uuid';

export const event = new EventEmitter();

export function create(type: string, data: EntityData, worldName: string, tick: Function | null) {
	let id = uuid();

	worldManager.get(worldName).entities[id] = new Entity(id, type, data, worldName, tick);

	event.emit('entity-create', {
		uuid: id,
		data: JSON.stringify(worldManager.get(worldName).entities[id].data),
	})

	return worldManager.get(worldName).entities[id];
}

export function recreate(id: string, type: string, data: EntityData, worldName: string, tick: Function | null) {
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

export class Entity {
	data: EntityData;
	readonly id: string;
	world: string;
	chunk: types.XZ;
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
		this.type = type;
		this.id = id;
		this.world = world;
		this.chunk = worldManager.toChunk(this.data.position).id;
		if (tick != null) this.tick = tick;
		else this.tick = function () {};
	}

	getObject(): { id: string; data: EntityData; chunk: Array<number> } {
		return { ...this };
	}

	teleport(pos: types.XYZ, eworld: string): void {
		this.world = eworld;
		this.data.position = pos;
		this.chunk = worldManager.toChunk(pos).id;
		event.emit('entity-move', {
			uuid: this.id,
			x: this.data.position[0],
			y: this.data.position[1],
			z: this.data.position[2],
			rotation: this.data.rotation,
		});
	}

	move(pos: types.XYZ): void {
		this.data.position = pos;
		this.chunk = worldManager.toChunk(pos).id;
		event.emit('entity-move', {
			uuid: this.id,
			x: this.data.position[0],
			y: this.data.position[1],
			z: this.data.position[2],
			rotation: this.data.rotation,
		});
	}

	rotate(rot: number): void {
		this.data.rotation = rot;
		event.emit('entity-move', {
			uuid: this.id,
			x: this.data.position[0],
			y: this.data.position[1],
			z: this.data.position[2],
			rotation: this.data.rotation,
		});
	}

	remove(): void {
		try {
			let id = this.id;
			event.emit('entity-remove', { uuid: this.id });

			setTimeout(() => {
				let world = worldManager.get(this.world);
				if (world.entities[id] != undefined) delete world.entities[id];
			}, 10);
		} catch (e) {
			console.log("Server tried to remove entity, but it didn't work! Error: ", e);
		}
	}

	getID(): string {
		return this.id;
	}
}

export function get(world, id) {
	return worldManager.get(world).entities[id];
}
export function getAll(world) {
	return worldManager.get(world).entities;
}
