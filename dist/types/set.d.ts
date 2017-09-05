import GrowableBuffer from '../lib/growable-buffer';
import AbsoluteType from './absolute';
import Type from './type';
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
 */
export default class SetType<E> extends AbsoluteType<Set<E>> {
    static readonly _value: number;
    /**
     * The [[Type]] passed to the constructor
     */
    readonly type: Type<E>;
    /**
     * @param type A [[Type]] that can serialize each element in the set
     */
    constructor(type: Type<E>);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
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
    writeValue(buffer: GrowableBuffer, value: Set<E>): void;
    equals(otherType: any): boolean;
}
