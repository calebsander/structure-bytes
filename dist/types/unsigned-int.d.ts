import GrowableBuffer from '../lib/growable-buffer';
import UnsignedType from './unsigned';
/**
 * A type storing a 4-byte unsigned integer (`0` to `4294967295`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedIntType
 * ````
 */
export default class UnsignedIntType extends UnsignedType<number | string> {
    static readonly _value: number;
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 1234567890) //or '1234567890'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @param root Omit if used externally; only used internally
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: GrowableBuffer, value: number | string): void;
}
