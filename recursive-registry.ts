import assert from './lib/assert'
import {RegisterableType, TypeAndName} from './recursive-registry-type'
import {ArrayType, MapType, SetType, StructType, TupleType} from './types'

//A map of names of recursive types to their types
const registeredTypes = new Map<string, RegisterableType>()
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
export function registerType({type, name}: TypeAndName): void {
	assert.instanceOf(type, [ //these are the only types capable of being recursive and having a known base value, e.g. [] or new Map
		ArrayType,
		MapType,
		SetType,
		StructType,
		TupleType
	])
	assert.instanceOf(name, String)
	assert(!isRegistered(name), '"' + name + '" is already a registered type')
	registeredTypes.set(name, type)
}
/** @function
 * @name getType
 * @desc Gets the recursive type
 * registered under the specified name
 * @throws {Error} If no type is registered with that name
 * @param {string} name The name of the registered type
 * @return {Type} The registered type
 */
export function getType(name: string): RegisterableType {
	assert.instanceOf(name, String)
	const type = registeredTypes.get(name)
	if (!type) throw new Error('"' + name + '" is not a registered type')
	return type
}
/** @function
 * @name isRegistered
 * @desc Returns whether the specified name
 * already has a recursive type registered with it
 * @param {string} name The name to check
 * @return {boolean} Whether the name has been mapped to a type
 * @see registerType
 */
export function isRegistered(name: string): boolean {
	return registeredTypes.has(name)
}