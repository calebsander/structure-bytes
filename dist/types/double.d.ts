import AppendableBuffer from '../lib/appendable';
import FloatingPointType from './floating';
/**
 * A type storing an 8-byte [IEEE floating point](https://en.wikipedia.org/wiki/IEEE_floating_point).
 * Can also represent `NaN`, `Infinity`, and `-Infinity`.
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.DoubleType
 * ````
 */
export default class DoubleType extends FloatingPointType {
    static readonly _value: number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * type.writeValue(buffer, 1.23) //or '1.23'
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, NaN) //or 'NaN'
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, Infinity) //or 'Infinity'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: number | string): void;
}
