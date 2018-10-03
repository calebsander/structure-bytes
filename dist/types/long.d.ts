import AppendableBuffer from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
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
export declare class LongType extends IntegerType<string, string> {
    static readonly _value: number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, '-1234567890123456789')
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: string): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<string>;
}
