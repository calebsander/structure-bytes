import AppendableBuffer from '../lib/appendable';
import { RegisterableType } from '../recursive-registry-type';
import AbsoluteType from './absolute';
import Type from './type';
/**
 * A type that can refer recursively to itself.
 * This is not a type in its own right, but allows you
 * to have some other type use itself in its definition.
 * Values that contain circular references will have the
 * references preserved after serialization and deserialization.
 *
 * Note that it is impossible to create self-referencing types
 * any other way, due to the immutable nature of types.
 * Also, other types will infinitely recurse on writes with circular references.
 *
 * Recursive types must be of one of the following types:
 * - [[ArrayType]]
 * - [[MapType]]
 * - [[SetType]]
 * - [[StructType]]
 * - [[TupleType]]
 *
 * This is due to the way that recursive values are deserialized.
 * For example, say the value was created with the following code:
 * ````javascript
 * let selfType = new sb.RecursiveType('self-type')
 * sb.registerType({
 *   type: new sb.StructType({
 *     self: selfType
 *   }),
 *   name: 'self-type'
 * })
 * let self = {} //note that we had to give self a "base value" of {}
 * self.self = self
 * ````
 * In order to deserialize the value, we need to carry out the same process:
 * - Set the value to some mutable base value so we have a reference to it
 * - Read the value for the `self` field, which gives the base value
 * - Assign the result of the read to the `self` field, mutating the base value
 *
 * The base values used are as follows:
 * - `[]` for [[ArrayType]] and [[TupleType]]
 * - `new Map` for [[MapType]]
 * - `new Set` for [[SetType]]
 * - `{}` for [[StructType]]
 *
 * Base values for other types are harder to compute, which is why
 * they are not allowed as [[RecursiveType]]s.
 * You can always use another type by making it the sole field
 * of a [[StructType]].
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
 * @param E The type of value this type can write
 * (presumably a recursive value)
 */
export default class RecursiveType<E> extends AbsoluteType<E> {
    static readonly _value: number;
    /**
     * The name passed into the constructor
     */
    readonly name: string;
    /**
     * @param name The name of the type,
     * as registered using [[registerType]]
     */
    constructor(name: string);
    readonly type: RegisterableType & Type<E>;
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * treeType.writeValue(buffer, {
     *   left: {
     *     left: {
     *       left: null,
     *       value: 1,
     *       right: null
     *     },
     *     value: 2,
     *     right: {
     *       left: null,
     *       value: 3,
     *       right: null
     *     }
     *   },
     *   value: 4,
     *   right: {
     *     left: null,
     *     value: 5,
     *     right: {
     *       left: null,
     *       value: 6,
     *       right: null
     *     }
     *   }
     * })
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`;
     * also throws if no type has been registered with this type's name
     */
    writeValue(buffer: AppendableBuffer, value: E): void;
    equals(otherType: any): boolean;
}
