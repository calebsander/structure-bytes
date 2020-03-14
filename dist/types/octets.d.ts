import type { AppendableBuffer } from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import AbsoluteType from './absolute';
/**
 * A type storing a variable-length array of bytes.
 * This is intended for data that
 * doesn't fit any other category,
 * e.g. the contents of a PNG file.
 *
 * Example:
 * ````javascript
 * let type = new sb.OctetsType
 * ````
 */
export declare class OctetsType extends AbsoluteType<ArrayBuffer | Uint8Array, ArrayBuffer> {
    static get _value(): number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * let octets = new Uint8Array([1, 2, 3, 4, 5])
     * type.writeValue(buffer, octets)
     * // or
     * type.writeValue(buffer, octets.buffer)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: ArrayBuffer | Uint8Array): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<ArrayBuffer>;
}
