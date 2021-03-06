import type { Server } from '../server';

type PermissionList = { [index: string]: boolean | null };
type Parents = { [index: string]: PermissionHolder };

import { IParentedPermissionHolder, ICorePermissionHolder, ICorePermissionManager } from 'voxelservercore/interfaces/permissions';


export class PermissionManager implements ICorePermissionManager {
	groups = {};
	_server: Server;

	constructor(server) {
		this._server = server;

		this.groups['default'] = new PermissionHolder({})
	}

	loadGroups(groups2) {
		for (const x in groups2) {
			this.groups[x] = new PermissionHolder(groups2[x].permissions);
		};
	}

	createGroup(name: string, group: PermissionHolder) {
		this.groups[name] = group;
	}

	removeGroup(name: string) {
		if (this.groups[name] != undefined) delete this.groups[name];
	}

	getGroup(name: string) {
		if (this.groups[name] != undefined) return this.groups[name];
	}

	getAllGroups() {
		return this.groups;
	}

	toObject() {
		const obj = {};

		for (const x in this.groups) {
			obj[x] = {permissions: this.groups[x].permissions}
		}

		return obj;
	}
}

export class PermissionHolder implements ICorePermissionHolder{
	readonly permissions: PermissionList = {};

	constructor(permissions: PermissionList = {}) {
		this.permissions = permissions;
	}

	check(perm: string | string[]): null | boolean {
		const pathString: string = Array.isArray(perm) ? perm.join('.') : perm;

		if (this.permissions[pathString] != undefined) return this.permissions[pathString];

		if (this.permissions['*'] != undefined) return this.permissions['*'];

		const path: Array<string> = Array.isArray(perm) ? perm : perm.split('.');
		let x = '';

		path.forEach((y) => {
			x = x + y + '.';
			if (this.permissions[x + '*'] != undefined) return this.permissions[x + '*'];
		});

		return null;
	}

	checkStrict(perm: string | string[]): null | boolean {
		const pathString: string = Array.isArray(perm) ? perm.join('.') : perm;

		if (this.permissions[pathString] != undefined) return this.permissions[pathString];

		return null;
	}

	add(perm: string, bool: boolean = true) {
		this.permissions[perm] = bool;
	}

	remove(perm: string) {
		delete this.permissions[perm];
	}
}

export class PlayerPermissionHolder extends PermissionHolder implements IParentedPermissionHolder {
	parents: Parents = {};

	_pm: PermissionManager;
	constructor(pm: PermissionManager, permissions: PermissionList = {}, parents: Array<string> = []) {
		super(permissions);
		this._pm = pm;

		parents.forEach((parent) => {
			if (pm.groups[parent] != undefined) this.parents[parent] = pm.groups[parent];
		});
	}

	check(perm: string | string[]): null | boolean {
		const pathString: string = Array.isArray(perm) ? perm.join('.') : perm;

		if (this.permissions[pathString] != undefined) return this.permissions[pathString];

		if (this.permissions['*'] != undefined) return this.permissions['*'];

		const path: Array<string> = Array.isArray(perm) ? perm : perm.split('.');
		let x = '';

		path.forEach((y) => {
			x = x + y + '.';
			if (this.permissions[x + '*'] != undefined) return this.permissions[x + '*'];
		});

		let returned = null;
		for (let x in this.parents) {
			returned = this.parents[x].check(perm);
			if (returned != null) return returned;
		}

		return null;
	}

	checkStrict(perm: string | string[]): null | boolean {
		const pathString: string = Array.isArray(perm) ? perm.join('.') : perm;

		if (this.permissions[pathString] != undefined) return this.permissions[pathString];

		let returned = null;
		for (let x in this.parents) {
			returned = this.parents[x].checkStrict(perm);
			if (returned != null) return returned;
		}

		return null;
	}

	addParent(parent: string) {
		if (this._pm.groups[parent] != undefined) this.parents[parent] = this._pm.groups[parent];
	}

	removeParent(parent: string) {
		if (this.parents[parent] != undefined) delete this.parents[parent];
	}
}
