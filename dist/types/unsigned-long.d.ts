import AppendableBuffer from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import UnsignedType from './unsigned';
/**
 * A type storing an 8-byte unsigned integer
 * (`0` to `18446744073709551615`).
 * Values to write must be given in base-10 string form.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedLongType
 * ````
 */
export declare class UnsignedLongType extends UnsignedType<string, string> {
    static readonly _value: number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, '1234567890123456789')
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: string): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<string>;
}
