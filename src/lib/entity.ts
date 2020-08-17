import * as worldManager from './worlds';
import * as prothelper from './protocol-helper';
import * as types from './types';

import { v4 as uuid } from 'uuid';

export function create(data: EntityData, worldName: string, tick: Function | null) {
	let id = uuid();

	worldManager.get(worldName).entities[id] = new Entity(id, data, worldName, tick);

	prothelper.broadcast('entityCreate', {
		uuid: id,
		data: JSON.stringify(worldManager.get(worldName).entities[id].data),
	});

	return worldManager.get(worldName).entities[id];
}

export function recreate(id: string, data: EntityData, worldName: string, tick: Function | null) {
	worldManager.get(worldName).entities[id] = new Entity(id, data, worldName, tick);

	prothelper.broadcast('entityCreate', {
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
	type: string;
	hitbox: types.XYZ;
}

export class Entity {
	data: EntityData;
	id: string;
	world: string;
	chunk: types.XZ;
	tick: Function | null;

	constructor(id: string, data: EntityData, world: string, tick: Function | null) {
		this.data = data;
		if (data.position == undefined) {
			this.data.position = [0, 0, 0];
		}
		if (data.rotation == undefined) {
			this.data.rotation = 0;
		}
		this.id = id;
		this.world = world;
		this.chunk = worldManager.toChunk(this.data.position).id;
		if (tick != null) this.tick = tick;
		else this.tick = function () {};
	}

	getObject(): { id: string; data: EntityData; chunk: Array<number> } {
		return {
			id: this.id,
			data: this.data,
			chunk: this.chunk,
		};
	}

	teleport(pos: types.XYZ, eworld: string): void {
		this.world = eworld;
		this.data.position = pos;
		this.chunk = worldManager.toChunk(pos).id;
		prothelper.broadcast('entityMove', {
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
		prothelper.broadcast('entityMove', {
			uuid: this.id,
			x: this.data.position[0],
			y: this.data.position[1],
			z: this.data.position[2],
			rotation: this.data.rotation,
		});
	}

	rotate(rot: number): void {
		this.data.rotation = rot;
		prothelper.broadcast('entityMove', {
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
			prothelper.broadcast('entityRemove', { uuid: this.id });

			if (this.data.type != 'player') {
				let world = worldManager.get(this.world);
				if (world.entities[id] != undefined) delete world.entities[id];
			}
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
