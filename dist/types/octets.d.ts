import GrowableBuffer from '../lib/growable-buffer';
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
export default class OctetsType extends AbsoluteType<ArrayBuffer> {
    static readonly _value: number;
    /**
     * Appends value bytes to a [[GrowableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * let octets = new Uint8Array([1, 2, 3, 4, 5])
     * type.writeValue(buffer, octets.buffer)
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: GrowableBuffer, value: ArrayBuffer): void;
}
