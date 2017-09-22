import AppendableBuffer from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import ChronoType from './chrono';
/**
 * A type storing a `Date` with millisecond precision.
 * The value is stored as an 8-byte signed integer.
 *
 * Example:
 * ````javascript
 * let type = new sb.DateType
 * ````
 */
export default class DateType extends ChronoType {
    static readonly _value: number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, new Date)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: Date): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<Date>;
}
