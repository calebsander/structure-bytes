import GrowableBuffer from '../lib/growable-buffer';
import IntegerType from './integer';
/**
 * A type storing an 8-byte signed integer
 * (`-9223372036854775808` to `9223372036854775807`).
 * Values to write must be given in base-10 string form.
 *
 * Example:
 * ````javascript
 * let type = new sb.LongType
 * ````
 */
export default class LongType extends IntegerType<string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, '-1234567890123456789')
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @param root Omit if used externally; only used internally
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: GrowableBuffer, value: string): void;
}
