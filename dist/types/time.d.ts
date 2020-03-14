import type { AppendableBuffer } from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import ChronoType from './chrono';
/**
 * A type storing a specific time of day,
 * with millisecond precision.
 * The value is stored as a 4-byte unsigned integer.
 * Writes `Date` objects, but their year, month, and date
 * are ignored.
 *
 * When values are read, they are set to the arbitrary day of
 * `1970-01-01`.
 *
 * Example:
 * ````javascript
 * let type = new sb.TimeType
 * ````
 */
export declare class TimeType extends ChronoType {
    static get _value(): number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, new Date(2017, 0, 1, 16, 37, 24, 189)) //16:37:24.189
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: Date): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<Date>;
}
