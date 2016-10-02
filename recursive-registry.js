const assert = require(__dirname + '/lib/assert.js')
const {Type} = require(__dirname + '/structure-types.js')

const registeredTypes = new Map
module.exports = {
	registerType({type, name}) {
		assert.instanceOf(type, Type)
		assert.instanceOf(name, String)
		assert.assert(!registeredTypes.has(name), '"' + name + '" is already a registered type')
		registeredTypes.set(name, type)
	},
	getType(name) {
		assert.instanceOf(name, String)
		const type = registeredTypes.get(name)
		assert.assert(type !== undefined, '"' + name + '" is not a registered type')
		return type
	}
}