module.exports = {
	name: 'Welcome',
	version: '0.0.1',
	api: '0.2.0-dev'
}

const { chat, players } = require('../src/api')

const cfg = require('../config.json')


players.event.on('create', function(data) {
	setTimeout(function() {
		cfg.plugins.welcome.forEach(function(text) { 
			chat.send(data.id, text)
		})
	}, 500)
})