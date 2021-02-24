import * as types from './types';

export const serverVersion = '0.2.0-beta.19.3';
export const serverProtocol = 3;

export interface IServerConfig {
	port: number;
	address: string;
	name: string;
	motd: string;
	public: boolean;
	maxplayers: number;
	viewDistance: number;
	chunkTransportCompression: boolean;
	world: {
		seed: number;
		border: number;
		spawn: types.XYZ;
		generator: string;
		save: boolean;
		worldGenWorkers: number;
	};
	plugins: string[];
	consoleInput: boolean;
	rateLimitChatMessages: boolean;
	[index: string]: any;
}

export const serverDefaultConfig: IServerConfig = {
	port: 3000,
	address: '0.0.0.0',
	name: 'Server',
	motd: 'Another VoxelSRV server',
	public: false,
	maxplayers: 10,
	viewDistance: 5,
	chunkTransportCompression: true,
	world: {
		seed: 0,
		border: 256,
		spawn: [0, 100, 0],
		generator: 'normal',
		save: true,
		worldGenWorkers: 1,
	},
	plugins: [],
	consoleInput: true,
	rateLimitChatMessages: true,
	//logs: true
};

export const invalidNicknameRegex = new RegExp('[^a-zA-Z0-9_]');

export const heartbeatServer = 'https://voxelsrv.pb4.eu';
