import type { AppendableBuffer } from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import type { RegisterableType } from '../recursive-registry-type';
import AbstractType from './abstract';
import type { Type } from './type';
export declare function rewindBuffer(buffer: AppendableBuffer): void;
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
 * selfType.setType(new sb.StructType({
 *   self: selfType
 * }))
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
 * treeType.setType(new sb.StructType({
 *   left: new sb.OptionalType(treeType),
 *   value: new sb.UnsignedByteType,
 *   right: new sb.OptionalType(treeType)
 * }))
 * ````
 *
 * @param E The type of value this type can write
 * (presumably a recursive value)
 * @param READ_E The type of value this type will read
 */
export declare class RecursiveType<E, READ_E extends E = E> extends AbstractType<E, READ_E> {
    readonly name: string;
    static get _value(): number;
    /**
     * @param name The name of the type,
     * as registered using [[registerType]]
     */
    constructor(name: string);
    get type(): RegisterableType & Type<E, READ_E>;
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * treeType.writeValue(buffer, {
     *   left: {
     *     left: {value: 1},
     *     value: 2,
     *     right: {value: 3}
     *   },
     *   value: 4,
     *   right: {
     *     value: 5,
     *     right: {value: 6}
     *   }
     * })
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`;
     * also throws if no type has been registered with this type's name
     */
    writeValue(buffer: AppendableBuffer, value: E): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<READ_E>;
    equals(otherType: unknown): otherType is this;
    /**
     * An alternative to [[registerType]],
     * to avoid writing the type's name twice.
     * Please use this instead of [[registerType]].
     *
     * So this
     * ````javascript
     * let type = new sb.RecursiveType('abc')
     * sb.registerType({
     *   type: new sb.StructType({
     *     //...
     *   }),
     *   name: 'abc'
     * })
     * ````
     * becomes
     * ````javascript
     * let type = new sb.RecursiveType('abc')
     * type.setType(new sb.StructType({
     *   //...
     * }))
     * ````
     * @param type The type to register
     */
    setType(type: RegisterableType): void;
}
