var virtFS = {}

var storeName = 'default'

function toPath(data) {
	var path = data.split('/')

	if (path[0] == '.') path.shift()

	return path
}


const virtualFS = {
	init(name) { storeName = name },
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

try {
	module.exports = require('fs')
} catch(e) {
	module.exports = virtualFS
}



