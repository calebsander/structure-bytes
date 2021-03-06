import type { AppendableBuffer } from '../lib/appendable';
import { BufferOffset } from '../lib/read-util';
import AbsoluteType from './absolute';
import type { Type } from './type';
/**
 * A type storing a variable-size set of values of the same type.
 * Works much like [[ArrayType]] except all values are `Set`s.
 *
 * Example:
 * ````javascript
 * //For storing some number of people
 * let personType = new sb.StructType({
 *   dob: new sb.DayType,
 *   name: new sb.StringType
 * })
 * let type = new sb.SetType(personType)
 * ````
 *
 * @param E The type of each element in the set
 * @param READ_E The type of each element
 * in the read set
 */
export declare class SetType<E, READ_E extends E = E> extends AbsoluteType<Set<E>, Set<READ_E>> {
    readonly type: Type<E, READ_E>;
    static get _value(): number;
    /**
     * @param type A [[Type]] that can serialize each element in the set
     */
    constructor(type: Type<E, READ_E>);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * let person1 = {dob: new Date(1980, 3, 10), name: 'Alfred'}
     * let person2 = {dob: new Date(1970, 4, 9), name: 'Betty'}
     * let person3 = {dob: new Date(1990, 5, 8), name: 'Cramer'}
     * type.writeValue(buffer, new Set([person1, person2, person3]))
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: Set<E>): void;
    consumeValue(bufferOffset: BufferOffset, baseValue?: Set<READ_E>): Set<READ_E>;
    equals(otherType: unknown): boolean;
}
