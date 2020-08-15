const items = require('./items').registry
const EventEmitter = require('events')

// Generic Inventory for mobs/block like chest, etc

class Inventory {
	constructor(size, data) {
		this.main = {}
		this.maxslot = size*9-1
		if (data != undefined && data != null) {
			this.main = data.main
		}

		for (let x = 0; x < size*9; x++) {
			if (this.main[x] == undefined) this.main[x] = {}
		}
		this.lastUpdate = Date.now()
		this.event = new EventEmitter()

	}

	add(item, count, data) {
		this.lastUpdate = Date.now()
		let invItems = Object.entries(this.main)
		for (let [slot, data] of invItems) {
			if (data.id == item && (data.count+count) < items[item].stack + 1) {
				this.main[slot] = {id: item, count: count+data.count, data: data}
				this.event.emit('slot-update', {data: this.main[slot], slot: slot, type: 'main'})
				return true
			}
		}
		for (let [slot, data] of invItems) {
			if (data.id == undefined) {
				this.main[slot] = {id: item, count: count, data: data}
				this.event.emit('slot-update', {data: this.main[slot], slot: slot, type: 'main'})
				return true
			}
		}
		return false
	}

	remove(item, count) {
		this.lastUpdate = Date.now()
		let allItems = Object.entries(this.main)
		let sel = this.selected
		if (this.main[sel].id == item) {
			let newcount = this.main[sel].count-count
			count = count - this.main[sel].count
			if (newcount > 0) this.main[sel] = {id: item, count: newcount, data: this.main[sel].data}
			else this.main[sel] = {}
			this.event.emit('slot-update', {data: this.main[sel], slot: sel, type: 'main'})
			if (count <= 0) return true
		}
		for (let [slot, data] of allItems) {
			if (count <= 0) return true
			if (data.id == item) {
				let newcount = data.count-count
				count = count - data.count
				if (newcount > 0) this.main[slot] = {id: item, count: newcount, data: data.data}
				else this.main[slot] = {}
				this.event.emit('slot-update', {data: this.main[slot], slot: slot, type: 'main'})
			}
		}
		return true
	}

	set(slot, item, count, data) {
		this.lastUpdate = Date.now()
		this.main[slot] = {id: item, count: count, data: data}
		this.event.emit('slot-update', {data: this.main[slot], slot: slot, type: 'main'})

	}

	contains(item, count) {
		let items = Object.entries(this.main)
	
		for (let [slot, data] of items) {
			if (data.id == item && data.count >= count) return slot
		}

		return -1
	}

}

// Inventory for players

class PlayerInventory extends Inventory {
	constructor(size, data) {
		super(size, data)
		if (data == undefined) {
			this.selected = 0
			this.tempslot = {}
		} else {
			this.selected = data.selected
			this.tempslot = data.tempslot
		}
		this.updated = false
	}

	select(slot) {
		this.selected = slot
	}

	getObject() {
		return {
			main: this.main,
			selected: this.selected,
			tempslot: this.tempslot
		}
	}

	getTool() {
		let sel = this.selected
		return this.main[sel]
	}

	action_switch(x, y) {
		this.lastUpdate = Date.now()
		this.updated = false
		let tempx = this.main[x]
		let tempy = this.main[y]
		this.main[x] = tempy
		this.main[y] = tempx
		this.event.emit('slot-update', {data: this.main[x], slot: x, type: 'main'})
		this.event.emit('slot-update', {data: this.main[y], slot: y, type: 'main'})

	}

	action_left(inv, x) {
		this.lastUpdate = Date.now()
		this.updated = false
		if (x >= 0) { // Normal slots
			let tempY = {...this.tempslot}
			let tempX = {...inv.main[x]}
			
			// If tempslot and target slot have the same itemtype
			if (tempY.id == tempX.id &&  tempY.id != undefined ) {
				if ((tempX.count + tempY.count) <= items[tempX.id].stack ) {
					let tempZ = {...tempX}
					tempZ.count = tempX.count + tempY.count
					inv.main[x] = tempZ
					this.tempslot = {}
				} else if ((tempX.count + tempY.count) > items[tempX.id].stack ) { 
					let tempZ = {...tempX}
					let tempW = {...tempY}
					tempZ.count = items[tempX.id].stack
					tempW.count = tempX.count + tempY.count - items[tempX.id].stack
					inv.main[x] = tempZ
					this.tempslot = tempW
				}
				inv.event.emit('slot-update', {data: inv.main[x], slot: x, type: 'main'})
				this.event.emit('slot-update', {data: this.tempslot, slot: -1, type: 'temp'})
			}
			// If target slot has diffrent itemtype	
			else {
				inv.main[x] = tempY
				this.tempslot = tempX
				inv.event.emit('slot-update', {data: inv.main[x], slot: x, type: 'main'})
				this.event.emit('slot-update', {data: this.tempslot, slot: -1, type: 'temp'})
			}
		}
	}

	action_right(inv, x) {
		this.lastUpdate = Date.now()
		this.updated = false
		// Normal slots
		if (x >= 0) {
			let tempY = {...this.tempslot}
			let tempX = {...inv.main[x]}
			if (tempY.id == undefined) { // Tempslot slot is empty
				let tempZ = {...tempX}
				let tempW = {...tempX}
				tempZ.count = Math.ceil(tempZ.count/2)
				tempW.count = Math.floor(tempW.count/2)
				if (tempW.count <= 0) tempW = {}
				inv.main[x] = {...tempZ}
				this.tempslot = {...tempW}
			} else if (tempX.id == undefined) { // Target is empty
				let tempZ = {...tempY}
				let tempW = {...tempY}
				tempZ.count = 1
				tempW.count = tempW.count - 1
				if (tempW.count <= 0) tempW = {}
				inv.main[x] = {...tempZ}
				this.tempslot = {...tempW}
			} else if (tempX.id == tempY.id && tempX.count+1 <= items[tempX.id].stack) { // The same itemtype
				let tempZ = {...tempX}
				let tempW = {...tempY}
				tempZ.count = tempZ.count + 1
				tempW.count = tempW.count - 1
				if (tempW.count <= 0) tempW = {}
				inv.main[x] = {...tempZ}
				this.tempslot = {...tempW}
			}
			inv.event.emit('slot-update', {data: inv.main[x], slot: x, type: 'main'})
			this.event.emit('slot-update', {data: this.tempslot, slot: -1, type: 'temp'})
		}
	}
}

module.exports = { 
	Inventory: Inventory,
	PlayerInventory: PlayerInventory
}