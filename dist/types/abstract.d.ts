import GrowableBuffer from '../lib/growable-buffer';
import Type from './type';
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
    /**
     * Generates the type buffer, recomputed each time
     * @private
     * @see Type#toBuffer
     * @return {external:ArrayBuffer} A Buffer containing the type bytes
     */
    private _toBuffer();
    getHash(): string;
    /**
     * Gets an SHA256 hash of the type, recomputed each time
     * @private
     * @see Type#getHash
     * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
     */
    private _getHash();
    getSignature(): string;
    /**
     * Gets a signature string for the type, recomputed each time
     * @private
     * @see Type#getSignature
     * @return {string} a signature for the type
     */
    private _getSignature();
    abstract writeValue(buffer: GrowableBuffer, value: VALUE, root?: boolean): void;
    valueBuffer(value: VALUE): ArrayBuffer;
    equals(otherType: any): boolean;
}
