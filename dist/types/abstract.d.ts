import GrowableBuffer from '../lib/growable-buffer';
import Type from './type';
/**
 * The superclass of all [[Type]] classes
 * in this package
 */
export default abstract class AbstractType<VALUE> implements Type<VALUE> {
    private cachedBuffer?;
    private cachedHash?;
    private cachedSignature?;
    private cachedTypeLocations?;
    /**
     * Returns an unsigned byte value unique to this type class;
     * used to serialize the type
     */
    static readonly _value: number;
    addToBuffer(buffer: GrowableBuffer): boolean;
    toBuffer(): ArrayBuffer;
    getHash(): string;
    getSignature(): string;
    abstract writeValue(buffer: GrowableBuffer, value: VALUE): void;
    valueBuffer(value: VALUE): ArrayBuffer;
    equals(otherType: any): boolean;
    /**
     * Generates the type buffer, recomputed each time
     * @private
     * @return An `ArrayBuffer` containing the type bytes
     */
    private _toBuffer();
    /**
     * Gets an SHA256 hash of the type, recomputed each time
     * @private
     * @return A hash of the buffer given by [[toBuffer]]
     */
    private _getHash();
    /**
     * Gets a signature string for the type, recomputed each time,
     * based on the `structure-bytes` protocol version and the type hash
     * @private
     * @return A signature for the type
     */
    private _getSignature();
}
