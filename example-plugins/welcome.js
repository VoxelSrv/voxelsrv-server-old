module.exports = {
	name: 'Welcome',
	version: '0.0.1',
	supports: '>=0.2.0-alpha'
}

const { chat, players } = require('../')

const cfg = require('../config.json')


players.event.on('create', function(data) {
	setTimeout(function() {
		cfg.plugins.welcome.forEach(function(text) { 
			chat.send(data.id, text)
		})
	}, 500)
})