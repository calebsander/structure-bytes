"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("./lib/assert");
const types_1 = require("./types");
//A map of names of recursive types to their types
const registeredTypes = new Map();
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
function registerType({ type, name }) {
    assert.instanceOf(type, [
        types_1.ArrayType,
        types_1.MapType,
        types_1.SetType,
        types_1.StructType,
        types_1.TupleType
    ]);
    assert.instanceOf(name, String);
    if (exports.isRegistered(name))
        throw new Error(`"${name}" is already a registered type`);
    registeredTypes.set(name, type);
}
exports.registerType = registerType;
/**
 * Gets the recursive type
 * registered with the specified name
 * @param name The name of the registered type
 * @return The registered type
 * @throws If no type is registered with that name
 */
function getType(name) {
    assert.instanceOf(name, String);
    const type = registeredTypes.get(name);
    if (!type)
        throw new Error(`"${name}" is not a registered type`);
    return type;
}
exports.getType = getType;
/**
 * Returns whether the specified name
 * already has a recursive type registered with it
 * from a call to [[registerType]]
 * @param name The name to check
 * @return Whether the name has been mapped to a type
 */
exports.isRegistered = (name) => registeredTypes.has(name);
