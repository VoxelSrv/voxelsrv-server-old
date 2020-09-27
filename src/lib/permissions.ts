type PermissionList = { [index: string]: boolean | null };
type Parents = { [index: string]: PermissionHolder };

export let groups = {};

export function loadGroups(groups2) {
	Object.entries(groups2).forEach((group: [string, any]) => {
		groups[group[0]] = new PermissionHolder(group[1].permissions);
	});
}

export function createGroup(name: string, group: PermissionHolder) {
	groups[name] = group;
}

export function removeGroup(name: string) {
	if (groups[name] != undefined) delete groups[name];
}

export function getGroup(name: string) {
	if (groups[name] != undefined) return groups[name];
}

export function getAllGroups() {
	return groups;
}

export class PermissionHolder {
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

export class PlayerPermissionHolder extends PermissionHolder {
	parents: Parents = {};

	constructor(permissions: PermissionList = {}, parents: Array<string> = []) {
		super(permissions);
		parents.forEach((parent) => {
			if (groups[parent] != undefined) this.parents[parent] = groups[parent];
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
		if (groups[parent] != undefined) this.parents[parent] = groups[parent];
	}

	removeParent(parent: string) {
		if (this.parents[parent] != undefined) delete this.parents[parent];
	}
}
