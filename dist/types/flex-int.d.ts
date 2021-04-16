import type { AppendableBuffer } from '../lib/appendable';
import { BufferOffset } from '../lib/read-util';
import IntegerType from './integer';
/**
 * Works like [[FlexUnsignedIntType]],
 * but allows for negative values as well.
 * Less efficient for storing positive values
 * than [[FlexUnsignedIntType]], so use that
 * instead if not storing negative values.
 * Also limited to values between
 * `-(2 ** 52)` and `2 ** 52 - 1`.
 * (Encodes `value` as approximately `2 * abs(value)`.)
 *
 * Example:
 * ````javascript
 * let type = new sb.FlexIntType
 * ````
 */
export declare class FlexIntType extends IntegerType<number | string, number> {
    static get _value(): number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * //Takes 4 bytes
     * type.writeValue(buffer, -2113664) //or '-2113664'
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: number | string): void;
    consumeValue(bufferOffset: BufferOffset): number;
}
