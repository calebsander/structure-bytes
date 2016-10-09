//For use with browserify
if (__dirname === '/') __dirname = ''

const assert = require(__dirname + '/lib/assert.js')
const t = require(__dirname + '/structure-types.js')

//A map of names of recursive types to their types
const registeredTypes = new Map
module.exports = {
	/** @function
	 * @name registerType
	 * @desc Registers a type under a name so
	 * the name can be used in a {@link RecursiveType}.
	 * The type must be either an {@link ArrayType},
	 * {@link MapType}, {@link SetType}, {@link StructType},
	 * or {@link TupleType} due to implementation limitations.
	 * If you need to use a different type, wrap it
	 * in a single-field {@link StructType}.
	 * @throws {Error} If a type is already registered under the name
	 * @param {{type, name}} params
	 * @param {Type} params.type The type to register
	 * @param {string} params.name The name to associate it with
	*/
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
	/** @function
	 * @name getType
	 * @desc Gets the recursive type
	 * registered under the specified name
	 * @throws {Error} If no type is registered with that name
	 * @param {string} name The name of the registered type
	 * @return {Type} The registered type
	 */
	getType(name) {
		assert.instanceOf(name, String)
		const type = registeredTypes.get(name)
		assert.assert(type !== undefined, '"' + name + '" is not a registered type')
		return type
	},
	/** @function
	 * @name isRegistered
	 * @desc Returns whether the specified name
	 * already has a recursive type registered with it
	 * @param {string} name The name to check
	 * @return {boolean} Whether the name has been mapped to a type
	 * @see registerType
	 */
	isRegistered(name) {
		return registeredTypes.has(name)
	}
}