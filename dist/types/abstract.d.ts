import { AppendableBuffer } from '../lib/appendable';
import type { ReadResult } from '../lib/read-util';
import type { Type } from './type';
/**
 * The superclass of all [[Type]] classes
 * in this package
 */
export default abstract class AbstractType<VALUE, READ_VALUE extends VALUE = VALUE> implements Type<VALUE, READ_VALUE> {
    private cachedBuffer?;
    private cachedHash?;
    private cachedSignature?;
    private cachedTypeLocations?;
    /**
     * Returns an unsigned byte value unique to this type class;
     * used to serialize the type
     */
    static get _value(): number;
    addToBuffer(buffer: AppendableBuffer): boolean;
    toBuffer(): ArrayBuffer;
    getHash(): string;
    getSignature(): string;
    abstract writeValue(buffer: AppendableBuffer, value: VALUE): void;
    valueBuffer(value: VALUE): ArrayBuffer;
    abstract consumeValue(buffer: ArrayBuffer, offset: number, baseValue?: unknown): ReadResult<READ_VALUE>;
    readValue(valueBuffer: ArrayBuffer | Uint8Array, offset?: number): READ_VALUE;
    equals(otherType: unknown): boolean;
    /**
     * Determines whether the input is a Type with the same class
     * @private
     * @param otherType A value, usually a Type instance
     * @returns whether `this` and `otherType` are instances of the same Type class
     */
    protected isSameType(otherType: unknown): otherType is this;
    /**
     * Generates the type buffer, recomputed each time
     * @private
     * @return An `ArrayBuffer` containing the type bytes
     */
    private _toBuffer;
    /**
     * Gets an SHA256 hash of the type, recomputed each time
     * @private
     * @return A hash of the buffer given by [[toBuffer]]
     */
    private _getHash;
    /**
     * Gets a signature string for the type, recomputed each time,
     * based on the `structure-bytes` protocol version and the type hash
     * @private
     * @return A signature for the type
     */
    private _getSignature;
}
