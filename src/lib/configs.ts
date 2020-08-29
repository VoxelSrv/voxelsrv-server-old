import * as fs from 'fs';

export function load(namespace: string, config: string) {
	if (fs.existsSync(`./config/${namespace}/${config}.json`)) {
		const data = fs.readFileSync(`./config/${namespace}/${config}.json`)
		return JSON.parse(data.toString())
	} else return {}
}


export function save(namespace: string, config: string, data: any) {
	if (!fs.existsSync(`./config/${namespace}`)) fs.mkdirSync(`./config/${namespace}`, { recursive: true })

	fs.writeFile(`./config/${namespace}/${config}.json`, JSON.stringify(data, null, 2), function (err) {
		if (err) console.error(`Cant save config ${namespace}/${config}! Reason: ${err}`);
	});
}