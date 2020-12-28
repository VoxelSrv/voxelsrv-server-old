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
export declare class Server extends EventEmitter {
    playerCount: number;
    registry: Registry;
    worlds: WorldManager;
    players: PlayerManager;
    entities: EntityManager;
    permissions: PermissionManager;
    config: IServerConfig;
    heartbeatID: number;
    log: Logging;
    status: string;
    plugins: {
        [index: string]: IPlugin;
    };
    constructor();
    private initDefaults;
    private initDefWorld;
    private startServer;
    heartbeatPing(): void;
    connectPlayer(socket: BaseSocket): Promise<void>;
    loadPluginsList(list: string[]): void;
    loadPlugin(plugin: IPlugin): void;
    stopServer(): void;
    loadConfig(namespace: string, config: string): any;
    saveConfig(namespace: string, config: string, data: any): void;
}
export interface IPlugin {
    name: string;
    version: string;
    supported: string;
    [index: string]: any;
}
//# sourceMappingURL=server.d.ts.map