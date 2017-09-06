import AppendableBuffer from '../lib/appendable';
import ChronoType from './chrono';
/**
 * A type storing a specific day in time.
 * The value is stored as a 3-byte signed integer.
 *
 * Example:
 * ````javascript
 * let type = new sb.DayType
 * ````
 */
export default class DayType extends ChronoType {
    static readonly _value: number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type.
     * Writes `Date` objects but ignores all units smaller than the day.
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, new Date(2001, 0, 1)) //Jan 1st, 2001
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: Date): void;
}
