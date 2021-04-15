import type { AppendableBuffer } from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import UnsignedType from './unsigned';
/**
 * A type storing an 8-byte unsigned integer
 * (`0` to `18446744073709551615`).
 * Each value must be provided as a BigInt.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedLongType
 * ````
 */
export declare class UnsignedLongType extends UnsignedType<bigint> {
    static get _value(): number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 12345678901234567890n)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: bigint): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<bigint>;
}
