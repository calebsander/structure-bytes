import GrowableBuffer from '../lib/growable-buffer';
import AbsoluteType from './absolute';
/**
 * A type storing a fixed-length array of `Boolean` values.
 * The length must be at most 255.
 * This type creates more efficient serializations than
 * `new sb.TupleType({type: new sb.BooleanType})` for boolean tuples,
 * since it works with bits instead of whole bytes.
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanTupleType(100)
 * ````
 */
export default class BooleanTupleType extends AbsoluteType<boolean[]> {
    static readonly _value: number;
    /**
     * The length of `boolean[]`s that this type can serialize
     */
    readonly length: number;
    /**
     * @param length The number of `Boolean`s in each value of this type. Must be between 0 and 255.
     */
    constructor(length: number);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, new Array(100).fill(true)) //takes up 13 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: GrowableBuffer, value: boolean[]): void;
    equals(otherType: any): boolean;
}
