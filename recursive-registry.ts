import assert from './lib/assert'
import {RegisterableType, TypeAndName} from './recursive-registry-type'
import ArrayType from './types/array'
import MapType from './types/map'
import SetType from './types/set'
import StructType from './types/struct'
import TupleType from './types/tuple'

//A map of names of recursive types to their types
const registeredTypes = new Map<string, RegisterableType>()

/**
 * Registers a type with a name so
 * the name can be used in a [[RecursiveType]].
 * Due to implementation limitations,
 * the type must be one of the following types:
 * - [[ArrayType]]
 * - [[MapType]]
 * - [[SetType]]
 * - [[StructType]]
 * - [[TupleType]]
 *
 * If you need to use a different type, wrap it
 * in a single-field [[StructType]].
 *
 * THIS METHOD OF REGISTERING RECURSIVE TYPES HAS BEEN DEPRECATED.
 * Instead, please use [[RecursiveType.setType]]:
 * ````javascript
 * //A binary tree of unsigned bytes
 * let treeType = new sb.RecursiveType('tree-node')
 * treeType.setType(new sb.StructType({
 *   left: new sb.OptionalType(treeType),
 *   value: new sb.UnsignedByteType,
 *   right: new sb.OptionalType(treeType)
 * }))
 * ````
 *
 * Example:
 * ````javascript
 * //A binary tree of unsigned bytes
 * let treeType = new sb.RecursiveType('tree-node')
 * sb.registerType({
 *   type: new sb.StructType({
 *     left: new sb.OptionalType(treeType),
 *     value: new sb.UnsignedByteType,
 *     right: new sb.OptionalType(treeType)
 *   }),
 *   name: 'tree-node' //name must match name passed to RecursiveType constructor
 * })
 * ````
 *
 * @param type The type to register
 * @param name The name to associate it with
 * @throws If a type is already registered under the name
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
/**
 * Gets the recursive type
 * registered with the specified name
 * @param name The name of the registered type
 * @return The registered type
 * @throws If no type is registered with that name
 */
export function getType(name: string): RegisterableType {
	assert.instanceOf(name, String)
	const type = registeredTypes.get(name)
	if (!type) throw new Error('"' + name + '" is not a registered type')
	return type
}
/**
 * Returns whether the specified name
 * already has a recursive type registered with it
 * from a call to [[registerType]]
 * @param name The name to check
 * @return Whether the name has been mapped to a type
 */
export function isRegistered(name: string): boolean {
	return registeredTypes.has(name)
}