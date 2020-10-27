"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerPermissionHolder = exports.PermissionHolder = exports.getAllGroups = exports.getGroup = exports.removeGroup = exports.createGroup = exports.loadGroups = exports.groups = void 0;
exports.groups = {};
function loadGroups(groups2) {
    Object.entries(groups2).forEach((group) => {
        exports.groups[group[0]] = new PermissionHolder(group[1].permissions);
    });
}
exports.loadGroups = loadGroups;
function createGroup(name, group) {
    exports.groups[name] = group;
}
exports.createGroup = createGroup;
function removeGroup(name) {
    if (exports.groups[name] != undefined)
        delete exports.groups[name];
}
exports.removeGroup = removeGroup;
function getGroup(name) {
    if (exports.groups[name] != undefined)
        return exports.groups[name];
}
exports.getGroup = getGroup;
function getAllGroups() {
    return exports.groups;
}
exports.getAllGroups = getAllGroups;
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
    constructor(permissions = {}, parents = []) {
        super(permissions);
        this.parents = {};
        parents.forEach((parent) => {
            if (exports.groups[parent] != undefined)
                this.parents[parent] = exports.groups[parent];
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
        if (exports.groups[parent] != undefined)
            this.parents[parent] = exports.groups[parent];
    }
    removeParent(parent) {
        if (this.parents[parent] != undefined)
            delete this.parents[parent];
    }
}
exports.PlayerPermissionHolder = PlayerPermissionHolder;
//# sourceMappingURL=permissions.js.map