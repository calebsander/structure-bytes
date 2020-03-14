import type { AppendableBuffer } from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import UnsignedType from './unsigned';
/**
 * A type storing a 1-byte unsigned integer (`0` to `255`).
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedByteType
 * ````
 */
export declare class UnsignedByteType extends UnsignedType<number | string, number> {
    static get _value(): number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 123) //or '123'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: number | string): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<number>;
}
