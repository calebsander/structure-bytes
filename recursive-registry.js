const assert = require(__dirname + '/lib/assert.js')
const t = require(__dirname + '/structure-types.js')

const registeredTypes = new Map
module.exports = {
	registerType({type, name}) {
		assert.instanceOf(type, [
			t.ArrayType,
			t.BooleanArrayType,
			t.BooleanTupleType,
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
	}
}