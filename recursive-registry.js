//For use with browserify
if (__dirname === '/') __dirname = ''

const assert = require(__dirname + '/lib/assert.js')
const t = require(__dirname + '/structure-types.js')

//A map of names of recursive types to their types
const registeredTypes = new Map
module.exports = {
	registerType({type, name}) {
		assert.instanceOf(type, [ //these are the only types capable of being recursive and having a known base value, e.g. [] or new Map
			t.ArrayType,
			t.MapType,
			t.SetType,
			t.StructType,
			t.TupleType
		])
		assert.instanceOf(name, String)
		assert.assert(!registeredTypes.has(name), '"' + name + '" is already a registered type')
		registeredTypes.set(name, type)
	},
	getType(name) {
		assert.instanceOf(name, String)
		const type = registeredTypes.get(name)
		assert.assert(type !== undefined, '"' + name + '" is not a registered type')
		return type
	},
	isRegistered(name) {
		return registeredTypes.has(name)
	}
}