const hook = require('../src/hooks')


hook.add('player-blockbreak', 0, function(name, action) {
	console.log(action)
	action.data = [0, 50, 0]
	console.log(action)
})