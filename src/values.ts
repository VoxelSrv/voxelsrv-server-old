import * as types from './types';
import { protocolVersion } from 'voxelsrv-protocol/const.json'

export const serverVersion = '0.2.0-beta.22';
export const serverProtocol = protocolVersion;

export interface IServerConfig {
	port: number;
	address: string;
	name: string;
	motd: string;
	public: boolean;
	requireAuth: boolean
	allowNotLogged: boolean
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
		borderBlock: string;
	};
	plugins: string[];
	consoleInput: boolean;
	rateLimitChatMessages: boolean;
	useWSS: boolean;
	wssOptions: { key: string; cert: string };
	[index: string]: any;
}

export const serverDefaultConfig: IServerConfig = {
	port: 3000,
	address: '0.0.0.0',
	name: 'Server',
	motd: 'Another VoxelSRV server',
	public: false,
	requireAuth: true,
	allowNotLogged: true,
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
		borderBlock: 'barrier',
	},
	plugins: [],
	consoleInput: true,
	rateLimitChatMessages: true,
	useWSS: false,
	wssOptions: { key: '', cert: '' },
	//logs: true
};

export const invalidNicknameRegex = new RegExp('[^a-zA-Z0-9_]');

export const heartbeatServer = 'https://voxelsrv.pb4.eu';
//export const heartbeatServer = 'http://localhost:9001';
