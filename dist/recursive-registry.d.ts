import { RegisterableType, TypeAndName } from './recursive-registry-type';
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
export declare function registerType({type, name}: TypeAndName): void;
/**
 * Gets the recursive type
 * registered with the specified name
 * @param name The name of the registered type
 * @return The registered type
 * @throws If no type is registered with that name
 */
export declare function getType(name: string): RegisterableType;
/**
 * Returns whether the specified name
 * already has a recursive type registered with it
 * from a call to [[registerType]]
 * @param name The name to check
 * @return Whether the name has been mapped to a type
 */
export declare function isRegistered(name: string): boolean;
