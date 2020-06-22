const chat = require('../src/chat')
const player = require('../src/player')
const cfg = require('../config.json')


player.event.on('create', function(data) {
	setTimeout(function() {
		cfg.plugins.welcome.forEach(function(text) { 
			chat.send(data.id, text)
		})
	}, 500)
})