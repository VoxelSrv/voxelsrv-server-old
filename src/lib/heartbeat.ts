import { serverConfig } from '../values';
import fetch from 'node-fetch';
import * as console from './console';

const heartbeat = 'pb4.eu:9001';
let id = 0;

function heartbeatPing() {
	fetch(`http://${heartbeat}/addServer?ip=${serverConfig.address}`)
		.then((res) => res.json())
		.then((json) => {
			console.log(`^bSended request to heartbeat: ^w${heartbeat}`);
			id = json.id;
		});
}

export default function startHeartbeat() {
	heartbeatPing();

	setInterval(() => {
		fetch(`http://${heartbeat}`)
			.then((res) => res.json())
			.then((json) => {
				if (json[id.toString()] == undefined) {
					heartbeatPing();
				}
			});
	}, 30000);
}
