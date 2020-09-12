type NestedPermission = boolean | null | { [index: string]: NestedPermission };
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

export function getAllGroups(name: string) {
	return groups;
}

export class PermissionHolder {
	readonly permissions: { [index: string]: NestedPermission } = {};

	constructor(permissions: { [index: string]: NestedPermission } = {}) {
		this.permissions = permissions;
	}

	check(perm: string | string[]): null | boolean {
		const path: Array<string> = Array.isArray(perm) ? perm : perm.split('.');
		let currientNode: NestedPermission = this.permissions;

		for (let x = 0; x < path.length - 1; x++) {
			if (!!currientNode['*']) return currientNode['*'] == true;
			else if (currientNode[path[x]] == undefined) return null;
			currientNode = currientNode[path[x]];
		}

		if (typeof currientNode[path[path.length - 1]] == 'boolean') return currientNode[path[path.length - 1]];
		else return null;
	}

	checkStrict(perm: string | string[]): null | boolean {
		const path: Array<string> = Array.isArray(perm) ? perm : perm.split('.');
		let currientNode: NestedPermission = this.permissions;

		for (let x = 0; x < path.length - 1; x++) {
			if (currientNode[path[x]] == undefined) return null;
			currientNode = currientNode[path[x]];
		}

		if (typeof currientNode[path[path.length - 1]] == 'boolean') return currientNode[path[path.length - 1]];
		else return null;
	}

	add(perm: string, bool: boolean = true) {
		const path: Array<string> = perm.split('.');
		let currientNode: NestedPermission = this.permissions;

		for (let x = 0; x < path.length - 1; x++) {
			if (currientNode[path[x]] == undefined) currientNode[path[x]] = {};
			currientNode = currientNode[path[x]];
		}
		currientNode[path[path.length - 1]] = bool;
	}

	remove(perm: string) {
		const path: Array<string> = perm.split('.');
		let currientNode: NestedPermission = this.permissions;

		for (let x = 0; x < path.length - 1; x++) {
			if (currientNode[path[x]] == undefined) return;
			currientNode = currientNode[path[x]];
		}
		delete currientNode[path[path.length - 1]];
	}
}

export class PlayerPermissionHolder extends PermissionHolder {
	parents: Parents = {};

	constructor(permissions: { [index: string]: NestedPermission } = {}, parents: Array<string> = []) {
		super(permissions);
		parents.forEach((parent) => {
			if (groups[parent] != undefined) this.parents[parent] = groups[parent];
		});
	}

	check(perm: string | string[]): null | boolean {
		const path: Array<string> = Array.isArray(perm) ? perm : perm.split('.');

		let returned: null | boolean = null;
		let local: null | boolean = null;
		Object.values(this.parents).forEach((parent) => {
			returned = parent.check(path);
		});

		let currientNode: NestedPermission = this.permissions;

		for (let x = 0; x < path.length - 1; x++) {
			if (!!currientNode['*']) {
				local = currientNode['*'];
				break;
			}
			else if (currientNode[path[x]] == undefined) {
				local = null;
				break;
			}
			currientNode = currientNode[path[x]];
		}

		if (typeof currientNode[path[path.length - 1]] == 'boolean') local = currientNode[path[path.length - 1]];
		return (local == null) ? returned : local;
	}

	checkStrict(perm: string | string[]): null | boolean {
		const path: Array<string> = Array.isArray(perm) ? perm : perm.split('.');

		let returned: null | boolean = null;
		let local: null | boolean = null;
		Object.values(this.parents).forEach((parent) => {
			returned = parent.checkStrict(path);
		});

		let currientNode: NestedPermission = this.permissions;

		for (let x = 0; x < path.length - 1; x++) {
			if (currientNode[path[x]] == undefined) {
				local = null;
				break;
			}
			currientNode = currientNode[path[x]];
		}

		if (typeof currientNode[path[path.length - 1]] == 'boolean') return currientNode[path[path.length - 1]];
		else return returned;
	}

	addParent(parent: string) {
		if (groups[parent] != undefined) this.parents[parent] = groups[parent];
	}

	removeParent(parent: string) {
		if (this.parents[parent] != undefined) delete this.parents[parent];
	}
}
