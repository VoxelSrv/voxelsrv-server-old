import * as types from './types';

export const serverVersion = '0.2.0-alpha';
export const serverProtocol = 2;

export interface IServerConfig {
	port: number;
	address: string;
	name: string;
	motd: string;
	public: boolean;
	maxplayers: number;
	world: {
		seed: number;
		border: number;
		spawn: types.XYZ;
		generator: string;
	};
	[index: string]: any;
}

export const serverDefaultConfig: IServerConfig = {
	port: 3000,
	address: '0.0.0.0',
	name: 'Server',
	motd: 'Another VoxelSRV server',
	public: false,
	maxplayers: 10,
	world: {
		seed: 0,
		border: 24,
		spawn: [0, 100, 0],
		generator: 'normal',
	},
};

export let serverConfig: IServerConfig = serverDefaultConfig;

export function setConfig(config: object) {
	serverConfig = { ...serverDefaultConfig, ...config };
}

export const invalidNicknameRegex = new RegExp('[^a-zA-Z0-9_]');
