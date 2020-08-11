try {
	module.exports = require('fs')
} catch(e) {
	var virtFS = {}

	var name = 'default'

	global.window = {indexedDB: indexedDB}

	const { Sifrr } = require('@sifrr/storage')

	var storage = new Sifrr.Storage({
		priority: ['indexeddb'], // Priority Array of type of storages to use
		name: 'worlds', // name of table (treat this as a variable name, i.e. no Spaces or special characters allowed)
		version: 1, // version number (integer / float / string), 1 is treated same as '1'
		desciption: 'All worlds', // description (text)
		size: 5 * 1024 * 1024 // Max db size in bytes only for websql (integer)
	})

	function toPath(data) {
		var path = data.split('/')

		if (path[0] == '.') path.shift()

		return path
	}

	module.exports = {
		async init(world) {
			name = world
			const data = await storage.get([name + '|players', name + '|worlds'])

			
			if (data[name + '|players'] == undefined) save = {}

			virtFS.worlds = {...data[name + '|worlds']}
			virtFS.players = {...data[name + '|players']}

			console.log({...virtFS.worlds}, {...data[name + '|worlds']})

			setInterval( async () => {
				storage.set(name + '|worlds', virtFS.worlds)
				storage.set(name + '|players', virtFS.players)
				console.log('Saved', virtFS)
			}, 10000)

			return true
		},
		async writeFile(fullPath, data, func) {
			var path = toPath(fullPath)
			var x = virtFS

			path.forEach( (element) => {
				if (element == path[ path.length - 1]) x[element] = data.valueOf()
				else if (x[element] != undefined) x = x[element]
				else func(`This path doesn't exist!`)
			})
		},

		existsSync(fullPath) {
			var x = virtFS

			var path = toPath(fullPath)

			path.forEach( (element) => {
				if (element == path[path.length -1]) return true
				else if (x[element] != undefined) x = x[element]
			})

			return false
		},

		readFileSync(fullPath) {
			var x = virtFS
			var path = toPath(fullPath)

			path.forEach( (element) => {
				if (element == path[path.length -1]) return x[element]
				else if (x[element] != undefined) x = x[element]
				else return null
			})
		},

		mkdirSync(fullPath) {
			var x = virtFS
			var path = toPath(fullPath)

			path.forEach( (element) => {
				if (element == path[path.length-1]) { x[element] = {}; return true}
				else if (x[element] != undefined) x = x[element]
				else return false
			})

		}
	}



}
