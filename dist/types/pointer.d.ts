import GrowableBuffer from '../lib/growable-buffer';
import AbstractType from './abstract';
import Type from './type';
/**
 * A type storing a value of another type through a pointer.
 * If you expect to have the same large value repeated many times,
 * using a pointer will decrease the size of the value [ArrayBuffer]{@link external:ArrayBuffer}.
 * Each time the value is written, it will use 4 bytes to write the pointer,
 * so you will only save space if the value is longer than 4 bytes and written more than once.
 * @example
 * //If the same people will be used many times
 * let personType = new sb.PointerType(
 *   new sb.StructType({
 *     dob: new sb.DateType,
 *     id: new sb.UnsignedShortType,
 *     name: new sb.StringType
 *   })
 * )
 * let tribeType = new sb.StructType({
 *   leader: personType,
 *   members: new sb.SetType(personType),
 *   money: new sb.MapType(personType, new sb.FloatType)
 * })
 * @extends Type
 * @inheritdoc
 */
export default class PointerType<E> extends AbstractType<E> {
    static readonly _value: number;
    readonly type: Type<E>;
    /**
     * @param {Type} type The type of any value
     */
    constructor(type: Type<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {type} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     * @example
     * let louis = {
     *   dob: new Date(1437592284193),
     *   id: 9,
     *   name: 'Louis'
     * },
     * garfield = {
     *   dob: new Date(1437592284194),
     *   id: 17,
     *   name: 'Garfield'
     * }
     * let value = {
     *   leader: {
     *     dob: new Date(1437592284192),
     *     id: 10,
     *     name: 'Joe'
     *   },
     *   members: new Set().add(louis).add(garfield),
     *   money: new Map().set(louis, 23.05).set(garfield, -10.07)
     * }
     * tribeType.writeValue(buffer, value)
     */
    writeValue(buffer: GrowableBuffer, value: E, root?: boolean): void;
    equals(otherType: any): boolean;
}
