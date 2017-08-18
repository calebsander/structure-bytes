"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./lib/assert");
const types_1 = require("./types");
//A map of names of recursive types to their types
const registeredTypes = new Map();
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
function registerType({ type, name }) {
    assert_1.default.instanceOf(type, [
        types_1.ArrayType,
        types_1.MapType,
        types_1.SetType,
        types_1.StructType,
        types_1.TupleType
    ]);
    assert_1.default.instanceOf(name, String);
    assert_1.default(!isRegistered(name), '"' + name + '" is already a registered type');
    registeredTypes.set(name, type);
}
exports.registerType = registerType;
/** @function
 * @name getType
 * @desc Gets the recursive type
 * registered under the specified name
 * @throws {Error} If no type is registered with that name
 * @param {string} name The name of the registered type
 * @return {Type} The registered type
 */
function getType(name) {
    assert_1.default.instanceOf(name, String);
    const type = registeredTypes.get(name);
    if (!type)
        throw new Error('"' + name + '" is not a registered type');
    return type;
}
exports.getType = getType;
/** @function
 * @name isRegistered
 * @desc Returns whether the specified name
 * already has a recursive type registered with it
 * @param {string} name The name to check
 * @return {boolean} Whether the name has been mapped to a type
 * @see registerType
 */
function isRegistered(name) {
    return registeredTypes.has(name);
}
exports.isRegistered = isRegistered;
