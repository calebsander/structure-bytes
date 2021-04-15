import type { AppendableBuffer } from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import AbsoluteType from './absolute';
import type { Type } from './type';
/**
 * A type storing a value of another type or `null` or `undefined`.
 * `null` and `undefined` are treated identically,
 * and reading either value will result in `null`.
 *
 * Example:
 * ````javascript
 * //If you have a job slot that may or may not be filled
 * let personType = new sb.StructType({
 *   age: new sb.UnsignedByteType,
 *   name: new sb.StringType
 * })
 * let type = new sb.StructType({
 *   title: new sb.StringType,
 *   employee: new sb.OptionalType(personType)
 * })
 * ````
 *
 * @param E The type of non-`null` values
 * @param READ_E The type of non-`null` read values
 */
export declare class OptionalType<E, READ_E extends E = E> extends AbsoluteType<E | null | undefined, READ_E | null> {
    readonly type: Type<E, READ_E>;
    static get _value(): number;
    /**
     * @param type The [[Type]] used to write values
     * if they are not `null` or `undefined`
     */
    constructor(type: Type<E, READ_E>);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * type.writeValue(buffer, {
     *   title: 'Manager',
     *   employee: null //or undefined
     * })
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, {
     *   title: 'Coder',
     *   employee: {age: 19, name: 'Johnny'}
     * })
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: E | null | undefined): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<READ_E | null>;
    equals(otherType: unknown): boolean;
}
