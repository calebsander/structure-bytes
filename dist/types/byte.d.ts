import AppendableBuffer from '../lib/appendable';
import IntegerType from './integer';
/**
 * A type storing a 1-byte signed integer (`-128` to `127`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.ByteType
 * ````
 */
export default class ByteType extends IntegerType<number | string> {
    static readonly _value: number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, -123) //or '-123'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: number | string): void;
}
