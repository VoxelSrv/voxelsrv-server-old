import type { EntityManager, Entity } from './entity';
import { WorldManager, World } from './worlds';
import type { Server } from '../server';
import * as types from '../types';
import * as chat from './chat';
import { PlayerInventory } from './inventory';
import { PlayerPermissionHolder } from './permissions';
import * as pClient from 'voxelsrv-protocol/js/client';
import { BaseSocket } from '../socket';
export declare class PlayerManager {
    players: {
        [index: string]: Player;
    };
    chunksToSend: any[];
    _server: Server;
    _entities: EntityManager;
    _worlds: WorldManager;
    _lastChunkUpdate: number;
    constructor(server: Server);
    create(id: string, data: any, socket: BaseSocket): Player;
    read(id: string): object | null;
    exist(id: string): boolean;
    save(id: string, data: Object): void;
    get(id: string): Player | null;
    getAll(): {
        [index: string]: Player;
    };
    sendPacketAll(type: string, data: any): void;
}
export declare class Player {
    readonly id: string;
    readonly nickname: string;
    displayName: string;
    entity: Entity;
    world: World;
    inventory: PlayerInventory;
    hookInventory: any;
    readonly socket: BaseSocket;
    permissions: PlayerPermissionHolder;
    chunks: types.anyobject;
    movement: PlayerMovement;
    crafting: {
        items: {
            0: any;
            1: any;
            2: any;
            3: any;
        };
        result: any;
    };
    _chunksToSend: any[];
    _chunksInterval: any;
    _players: PlayerManager;
    _server: Server;
    constructor(id: string, name: string, socket: BaseSocket, players: PlayerManager);
    getObject(): {
        id: string;
        nickname: string;
        entity: import("./entity").IEntityObject;
        inventory: import("./inventory").InventoryObject;
        world: string;
        permissions: {
            [index: string]: boolean;
        };
        permissionparents: string[];
        movement: PlayerMovement;
    };
    sendPacket(type: string, data: Object): void;
    remove(): void;
    teleport(pos: types.XYZ, eworld: string | World): void;
    move(pos: types.XYZ): void;
    send(msg: string | chat.ChatMessage): void;
    rotate(rot: number | null, pitch: number | null): void;
    kick(reason: string): void;
    updateMovement(key: string, value: number): void;
    updatePhysics(key: string, value: number): void;
    applyForce(x: number, y: number, z: number): void;
    setTab(msg: chat.ChatMessage): void;
    updateChunks(): Promise<void>;
    get getID(): string;
    action_blockbreak(data: pClient.IActionBlockBreak & {
        cancel: boolean;
    }): void;
    action_blockplace(data: pClient.IActionBlockPlace & {
        cancel: boolean;
    }): void;
    action_invclick(data: pClient.IActionInventoryClick & {
        cancel: boolean;
    }): void;
    action_chatsend(data: pClient.IActionMessage & {
        cancel: boolean;
    }): void;
    action_move(data: pClient.IActionMove & {
        cancel: boolean;
    }): void;
    action_click(data: pClient.IActionClick & {
        cancel: boolean;
    }): void;
    action_entityclick(data: pClient.IActionClickEntity & {
        cancel: boolean;
    }): void;
}
export interface PlayerMovement {
    airJumps: number;
    airMoveMult: number;
    crouch: boolean;
    crouchMoveMult: number;
    jumpForce: number;
    jumpImpulse: number;
    jumpTime: number;
    jumping: boolean;
    maxSpeed: number;
    moveForce: number;
    responsiveness: number;
    running: boolean;
    runningFriction: number;
    sprint: boolean;
    sprintMoveMult: number;
    standingFriction: number;
}
export declare const defaultPlayerMovement: {
    airJumps: number;
    airMoveMult: number;
    crouch: boolean;
    crouchMoveMult: number;
    jumpForce: number;
    jumpImpulse: number;
    jumpTime: number;
    jumping: boolean;
    maxSpeed: number;
    moveForce: number;
    responsiveness: number;
    running: boolean;
    runningFriction: number;
    sprint: boolean;
    sprintMoveMult: number;
    standingFriction: number;
};
//# sourceMappingURL=player.d.ts.map