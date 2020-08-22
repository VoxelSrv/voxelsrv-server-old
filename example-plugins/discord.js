module.exports = {
	name: 'Discord',
	version: '0.0.1',
	supported: '>=0.2.0-alpha'
}

const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()

const { chat, console } = require('../')

const cfg = require('../config').plugins.discord

if (cfg.token == '') return 

client.commands = new Discord.Collection()


client.on('message', message => {
	if (message.author.bot) return
	if (message.channel == cfg.channel) {
		chat.send('#all', '**[Discord]** ' + message.member.displayName + ' » ' + message.content)
	}
})

chat.event.on('message', function(data) {
	client.channels.fetch(cfg.channel).then( function(channel) { channel.send(data.msg) })
})

client.on('ready', () => {
	console.log(`Discord: Logged in as ${client.user.tag}!`)
})

client.login(cfg.token)