import GrowableBuffer from '../lib/growable-buffer';
import AbsoluteType from './absolute';
/**
 * A type storing a fixed-length array of {@link Boolean} values.
 * This type creates more efficient serializations than
 * {@link TupleType} for boolean arrays.
 * The length must be at most 255.
 * @see BooleanType
 * @see TupleType
 * @extends Type
 * @inheritdoc
 */
export default class BooleanTupleType extends AbsoluteType<boolean[]> {
    static readonly _value: number;
    readonly length: number;
    /**
     * @param {number} length The number of {@link Boolean}s in each value of this type.
     * Must fit in a 1-byte unsigned integer.
     */
    constructor(length: number);
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {Boolean[]} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: boolean[]): void;
    equals(otherType: any): boolean;
}
