import GrowableBuffer from '../lib/growable-buffer';
import IntegerType from './integer';
/**
 * A type storing an arbitrary precision signed integer.
 * Each written value has its own number of bytes of precision.
 * @extends Type
 * @inheritdoc
 */
export default class BigIntType extends IntegerType<string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {string} value The value to write (a base-10 string representation of an integer)
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: string): void;
}
