/// <reference types="node" />
import { EventEmitter } from 'events';
import { Registry } from './lib/registry';
import { WorldManager } from './lib/worlds';
import { EntityManager } from './lib/entity';
import { PermissionManager } from './lib/permissions';
import { PlayerManager } from './lib/player';
import { IServerConfig } from './values';
import { BaseSocket } from './socket';
import { Logging } from './lib/console';
import type { ICoreServer } from 'voxelservercore/interfaces/server';
import type { ICorePlugin } from 'voxelservercore/interfaces/plugin';
export declare class Server extends EventEmitter implements ICoreServer {
    playerCount: number;
    registry: Registry;
    worlds: WorldManager;
    players: PlayerManager;
    entities: EntityManager;
    permissions: PermissionManager;
    config: IServerConfig;
    heartbeatID: number;
    log: Logging;
    console: Console;
    status: string;
    plugins: {
        [index: string]: ICorePlugin;
    };
    constructor();
    private initDefaults;
    private initDefWorld;
    private startServer;
    heartbeatPing(): void;
    connectPlayer(socket: BaseSocket): Promise<void>;
    loadPluginsList(list: string[]): void;
    loadPlugin(plugin: ICorePlugin): void;
    stopServer(): void;
    loadConfig(namespace: string, config: string): any;
    saveConfig(namespace: string, config: string, data: any): void;
}
declare class Console {
    s: Server;
    constructor(s: Server);
    executor: any;
    executorchat: any;
}
export {};
//# sourceMappingURL=server.d.ts.map