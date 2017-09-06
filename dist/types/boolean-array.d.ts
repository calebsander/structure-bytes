import AppendableBuffer from '../lib/appendable';
import AbsoluteType from './absolute';
/**
 * A type storing a variable-length array of `Boolean` values.
 * This type creates more efficient serializations than
 * `new sb.ArrayType(new sb.BooleanType)` for boolean arrays,
 * since it works with bits instead of whole bytes.
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanArrayType
 * ````
 */
export default class BooleanArrayType extends AbsoluteType<boolean[]> {
    static readonly _value: number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * type.writeValue(buffer, [false]) //takes up 2 bytes
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, new Array(100).fill(true)) //takes up 14 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: boolean[]): void;
}
