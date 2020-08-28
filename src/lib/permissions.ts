type NestedPermission = boolean | null | { [index: string]: NestedPermission };
//type Parents = { [index: string]: string };

export class PermissionHolder {
	readonly permissions: { [index: string]: NestedPermission } = {};

	constructor(permissions: { [index: string]: NestedPermission } = {}) {
		this.permissions = permissions;
	}

	check(perm: string): null | boolean {
		const path: Array<string> = perm.split('.');
		let currientNode: NestedPermission = this.permissions;

		for (let x = 0; x < path.length - 1; x++) {
			if (!!currientNode['*']) return currientNode['*'] == true;
			else if (currientNode[path[x]] == undefined) return null;
			currientNode = currientNode[path[x]];
		}

		if (typeof currientNode[path[path.length - 1]] == 'boolean') return currientNode[path[path.length - 1]];
		else return null;
	}

	checkStrict(perm: string): null | boolean {
		const path: Array<string> = perm.split('.');
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
