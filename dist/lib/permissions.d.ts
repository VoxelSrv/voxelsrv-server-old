declare type PermissionList = {
    [index: string]: boolean | null;
};
declare type Parents = {
    [index: string]: PermissionHolder;
};
export declare let groups: {};
export declare function loadGroups(groups2: any): void;
export declare function createGroup(name: string, group: PermissionHolder): void;
export declare function removeGroup(name: string): void;
export declare function getGroup(name: string): any;
export declare function getAllGroups(): {};
export declare class PermissionHolder {
    readonly permissions: PermissionList;
    constructor(permissions?: PermissionList);
    check(perm: string | string[]): null | boolean;
    checkStrict(perm: string | string[]): null | boolean;
    add(perm: string, bool?: boolean): void;
    remove(perm: string): void;
}
export declare class PlayerPermissionHolder extends PermissionHolder {
    parents: Parents;
    constructor(permissions?: PermissionList, parents?: Array<string>);
    check(perm: string | string[]): null | boolean;
    checkStrict(perm: string | string[]): null | boolean;
    addParent(parent: string): void;
    removeParent(parent: string): void;
}
export {};
//# sourceMappingURL=permissions.d.ts.map