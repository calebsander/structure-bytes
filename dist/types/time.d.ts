import GrowableBuffer from '../lib/growable-buffer';
import ChronoType from './chrono';
/**
 * A type storing a specific time of day.
 * The value is stored as a 4-byte unsigned integer.
 * @extends Type
 * @inheritdoc
 */
export default class TimeType extends ChronoType {
    static readonly _value: number;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {external:Date} value The value to write
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: Date): void;
}
