import AppendableBuffer from '../lib/appendable';
import AbsoluteType from './absolute';
import Type from './type';
/**
 * A [[Type]] for writing values of type `E`
 * and a number of elements in the tuple
 *
 * @param E The type of each element in the tuple
 */
export interface TupleParams<E> {
    type: Type<E>;
    length: number;
}
/**
 * A type storing a fixed-length array of values of the same type.
 * The length must be at most 255.
 *
 * Example:
 * ````javascript
 * //For storing a 3x3 matrix
 * //This represents values just as efficiently
 * //as a single tuple with 9 elements
 * let type = new sb.TupleType({
 *   type: new sb.TupleType({
 *     type: new sb.FloatType,
 *     length: 3
 *   }),
 *   length: 3
 * })
 * ````
 *
 * @param E The type of each element in the tuple
 */
export default class TupleType<E> extends AbsoluteType<E[]> {
    static readonly _value: number;
    /**
     * The [[Type]] passed to the constructor
     */
    readonly type: Type<E>;
    /**
     * The length passed to the constructor
     */
    readonly length: number;
    /**
     * @param type A [[Type]] that can write each element in the tuple
     * @param length The number of elements in the tuple.
     * Must be at most 255.
     */
    constructor({type, length}: TupleParams<E>);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, [
     *   [1, 2, 3],
     *   [4, 5, 6],
     *   [7, 8, 9]
     * ])
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: E[]): void;
    equals(otherType: any): boolean;
}
