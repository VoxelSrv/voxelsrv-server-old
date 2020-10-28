"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerPermissionHolder = exports.PermissionHolder = exports.PermissionManager = void 0;
class PermissionManager {
    constructor(server) {
        this.groups = {};
        this._server = server;
    }
    loadGroups(groups2) {
        Object.entries(groups2).forEach((group) => {
            this.groups[group[0]] = new PermissionHolder(group[1].permissions);
        });
    }
    createGroup(name, group) {
        this.groups[name] = group;
    }
    removeGroup(name) {
        if (this.groups[name] != undefined)
            delete this.groups[name];
    }
    getGroup(name) {
        if (this.groups[name] != undefined)
            return this.groups[name];
    }
    getAllGroups() {
        return this.groups;
    }
}
exports.PermissionManager = PermissionManager;
class PermissionHolder {
    constructor(permissions = {}) {
        this.permissions = {};
        this.permissions = permissions;
    }
    check(perm) {
        const pathString = Array.isArray(perm) ? perm.join('.') : perm;
        if (this.permissions[pathString] != undefined)
            return this.permissions[pathString];
        if (this.permissions['*'] != undefined)
            return this.permissions['*'];
        const path = Array.isArray(perm) ? perm : perm.split('.');
        let x = '';
        path.forEach((y) => {
            x = x + y + '.';
            if (this.permissions[x + '*'] != undefined)
                return this.permissions[x + '*'];
        });
        return null;
    }
    checkStrict(perm) {
        const pathString = Array.isArray(perm) ? perm.join('.') : perm;
        if (this.permissions[pathString] != undefined)
            return this.permissions[pathString];
        return null;
    }
    add(perm, bool = true) {
        this.permissions[perm] = bool;
    }
    remove(perm) {
        delete this.permissions[perm];
    }
}
exports.PermissionHolder = PermissionHolder;
class PlayerPermissionHolder extends PermissionHolder {
    constructor(pm, permissions = {}, parents = []) {
        super(permissions);
        this.parents = {};
        this._pm = pm;
        parents.forEach((parent) => {
            if (pm.groups[parent] != undefined)
                this.parents[parent] = pm.groups[parent];
        });
    }
    check(perm) {
        const pathString = Array.isArray(perm) ? perm.join('.') : perm;
        if (this.permissions[pathString] != undefined)
            return this.permissions[pathString];
        if (this.permissions['*'] != undefined)
            return this.permissions['*'];
        const path = Array.isArray(perm) ? perm : perm.split('.');
        let x = '';
        path.forEach((y) => {
            x = x + y + '.';
            if (this.permissions[x + '*'] != undefined)
                return this.permissions[x + '*'];
        });
        let returned = null;
        for (let x in this.parents) {
            returned = this.parents[x].check(perm);
            if (returned != null)
                return returned;
        }
        return null;
    }
    checkStrict(perm) {
        const pathString = Array.isArray(perm) ? perm.join('.') : perm;
        if (this.permissions[pathString] != undefined)
            return this.permissions[pathString];
        let returned = null;
        for (let x in this.parents) {
            returned = this.parents[x].checkStrict(perm);
            if (returned != null)
                return returned;
        }
        return null;
    }
    addParent(parent) {
        if (this._pm.groups[parent] != undefined)
            this.parents[parent] = this._pm.groups[parent];
    }
    removeParent(parent) {
        if (this.parents[parent] != undefined)
            delete this.parents[parent];
    }
}
exports.PlayerPermissionHolder = PlayerPermissionHolder;
//# sourceMappingURL=permissions.js.map