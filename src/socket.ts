import * as protocol from 'voxelsrv-protocol';
import type WebSocket from 'ws';

export class BaseSocket {
	socket: any;
	listeners: { [i: string]: { callback: (data: any) => void; remove: boolean }[] } = {};
	debugListener: (sender: string, type: string, data: object) => void = (sender, type, data) => {};
	ip: string = '0.0.0.0';

	constructor(ip: string) {
		this.ip = ip;
	}

	send(type: string, data: Object) {
		const packet = protocol.parseToMessage('server', type, data);
		if (packet != null) {
			this.socket.send(packet);
			this.debugListener('server', type, data);
		}
	}

	close() {
		this.emit('close', true);
		this.listeners = {};
	}

	protected emit(type, data) {
		this.debugListener('client', type, data);
		if (this.listeners[type] != undefined) {
			this.listeners[type] = this.listeners[type].filter((event) => {
				event.callback(data);
				
				return !event.remove;
			});
		}
	}

	on(type: string, func: (data: any) => void) {
		if (this.listeners[type] != undefined) {
			this.listeners[type].push({ callback: func, remove: false });
		} else {
			this.listeners[type] = new Array();
			this.listeners[type].push({ callback: func, remove: false });
		}
	}

	once(type: string, func: (data: any) => void) {
		if (this.listeners[type] != undefined) {
			this.listeners[type].push({ callback: func, remove: true });
		} else {
			this.listeners[type] = new Array();
			this.listeners[type].push({ callback: func, remove: true });
		}
	}
}

export class WSSocket extends BaseSocket {
	constructor(socket: WebSocket, ip: string) {
		super(ip);

		this.socket = socket;

		this.socket.binaryType = 'arraybuffer';

		this.socket.onopen = () => {
			this.emit('connection', {});
		};

		this.socket.on('error', () => {
			this.emit('error', { reason: `Connection error!` });
		});

		this.socket.on('close', () => {
			this.emit('close', { reason: `Connection closed!` });
		});

		this.socket.on('message', (m: ArrayBuffer) => {
			try {
				const packet = protocol.parseToObject('client', new Uint8Array(m));
				if (packet != null) this.emit(packet.type, packet.data);
			} catch (e) {
				console.error('Invalid message', e);
				socket.close();
			}
		});
	}

	close() {
		this.emit('close', true);
		this.listeners = {};
		this.socket.close();
	}
}
