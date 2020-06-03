var EntComp = require('ent-comp')
var ecs = new EntComp()

module.exports = {
	create(data) { return createEntity(data) },
	delete(id) { deleteEntity(id) }
}

var compList = ['inventory', 'movement', 'position']

compList.forEach(function(value) {
	ecs.createComponent( require('./entity-comp/' + value) )
})

ecs.createComponent({
	name: 'base',
	state: {
		name: null,
		type: 'none',
		health: 20,
		maxhealth: 20,
		model: 'default'
	}
})

function createEntity(data) {
	var id = ecs.createEntity()
	for (let [key, value] of data.entries) {
		if (value != 0) ecs.addComponent(id, key, value)
		else ecs.addComponent(id, key)		
	}
	return id
}

function deleteEntity(id) {
	ecs.deleteEntity(id)
}