var player = {}

function createPlayer(id, data) {
	player[id] = {
		id: id,
		nickname: data.nickname
	}
}

function movePlayer(id, pos) {

}

function removePlayer(id) {
	player[id] = null
}

function getNickname(id) {
	return player[id].nickname
}



module.exports = {
	create(id, data) { createPlayer(id, data) },
	remove(id) { removePlayer(id) },
	getName(id) { return getNickname(id) }

}