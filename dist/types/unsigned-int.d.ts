import type { AppendableBuffer } from '../lib/appendable';
import { BufferOffset } from '../lib/read-util';
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
export declare class UnsignedIntType extends UnsignedType<number | string, number> {
    static get _value(): number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, 1234567890) //or '1234567890'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: number | string): void;
    consumeValue(bufferOffset: BufferOffset): number;
}
