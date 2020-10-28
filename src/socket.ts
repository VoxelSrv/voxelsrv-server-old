import * as protocol from './lib/protocol';

export class BaseSocket {
	socket: any;
	listeners: Object = {};
	server: string;

	constructor() {}

	send(type: string, data: Object) {
		const packet = protocol.parseToMessage('server', type, data);
		if (packet != null) {
			this.socket.send(packet);
		}
	}

	close() {
		this.emit('close', true)
		this.listeners = {};
	}

	protected emit(type, data) {
		if (this.listeners[type] != undefined) {
			this.listeners[type].forEach((func) => {
				func(data);
			});
		}
	}

	on(type: string, func: Function) {
		if (this.listeners[type] != undefined) {
			this.listeners[type].push(func);
		} else {
			this.listeners[type] = new Array();
			this.listeners[type].push(func);
		}
	}
}

export class WSSocket extends BaseSocket {
	constructor(socket) {
		super();

		this.socket = socket;

		this.socket.binaryType = 'arraybuffer';

		this.socket.onopen = () => {
			this.emit('connection', {});
		};

		this.socket.on('error', () => {
			this.emit('error', { reason: `Connection error!` } );
		});

		this.socket.on('close', () => {
			this.emit('close', { reason: `Connection closed!` });
		});

		this.socket.on('message', (m: ArrayBuffer) => {
			const packet = protocol.parseToObject('client', new Uint8Array(m));
			if (packet != null) this.emit(packet.type, packet.data);
		});
	}

	close() {
		this.emit('close', true)
		this.listeners = {};
		this.socket.close();
	}
}
