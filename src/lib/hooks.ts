const hooks = {};

export function create(name: string, size: number): string {
	hooks[name] = new Array(size);
	for (let x = 0; x < hooks[name].length; x++) {
		hooks[name][x] = [];
	}
	return name;
}

export function execute(name: string, data: object): number {
	let r: number = 0;
	if (hooks[name] != undefined) {
		for (let x = 0; x < hooks[name].length; x++) {
			for (var y = 0; y < hooks[name][x].length; y++) {
				r = hooks[name][x][y](name, data);
				if (r == 1) {
					return r;
				}
			}
		}
	} else {
		r = 1;
		return r;
	}
}

export function add(name: string, priority: number, func: Function) {
	if (hooks[name] != undefined) {
		if (hooks[name][priority] != undefined) {
			hooks[name][priority].push(func);
		} else return false;
	} else return false;
}
