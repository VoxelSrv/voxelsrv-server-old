const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()

const chat = require('../src/chat')

const cfg = require('../config').plugins.discord

if (cfg.token == '') return 

client.commands = new Discord.Collection()


client.on('message', message => {
	if (message.author.bot) return
	if (message.channel == cfg.channel) {
		chat.send(-3, '**[Discord]** ' + message.member.displayName + ' » ' + message.content)
	}
})

chat.event.on('message', function(data) {
	if (data.id == -2) client.channels.fetch(cfg.channel).then( function(channel) { channel.send(data.msg) })
})

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`)
})

client.login(cfg.token)