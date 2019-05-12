import AppendableBuffer from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import AbstractType from './abstract';
import { Type } from './type';
export declare function rewindBuffer(buffer: AppendableBuffer): void;
/**
 * A type storing a value of another type through a pointer.
 * If you expect to have the same large value repeated many times,
 * using a pointer will decrease the size of the value `ArrayBuffer`.
 * If the value has already been written, 1 to 2 bytes are
 * likely needed to write the pointer (more if values are far apart
 * in output buffer).
 * In comparison to without a pointer type, only 1 extra byte will
 * be used if the value has not yet been written to the output buffer.
 *
 * Example:
 * ````javascript
 * //If the same people will be used many times
 * let personType = new sb.PointerType(
 *   new sb.StructType({
 *     dob: new sb.DayType,
 *     id: new sb.UnsignedShortType,
 *     name: new sb.StringType
 *   })
 * )
 * let tribeType = new sb.StructType({
 *   leader: personType,
 *   members: new sb.SetType(personType),
 *   money: new sb.MapType(personType, new sb.FloatType)
 * })
 * ````
 *
 * @param E The type of values that can be written
 * @param READ_E The type of values that will be read
 */
export declare class PointerType<E, READ_E extends E = E> extends AbstractType<E, READ_E> {
    static readonly _value: number;
    /**
     * The [[Type]] passed to the constructor
     */
    readonly type: Type<E, READ_E>;
    /**
     * @param type The [[Type]] used to write the values being pointed to
     */
    constructor(type: Type<E, READ_E>);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
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
     *   members: new Set([louis, garfield]),
     *   money: new Map().set(louis, 23.05).set(garfield, -10.07)
     * }
     * tribeType.writeValue(buffer, value)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: E): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<READ_E>;
    equals(otherType: any): boolean;
}
