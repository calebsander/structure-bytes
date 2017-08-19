import GrowableBuffer from '../lib/growable-buffer';
/**
 * The superclass of each class representing a possible type.
 * This class should only be used to check if an object is a valid type.
 */
export default interface Type<VALUE> {
    /**
     * Appends the type information to a {@link GrowableBuffer}.
     * All types start with the byte specified by {@link Type._value}.
     * For the most primitive types, this implementation is sufficient.
     * More complex types should override this method,
     * invoking [super.addToBuffer()]{@link Type#addToBuffer} and then adding their own data if it returns true.
     * @param {GrowableBuffer} buffer The buffer to append to
     * @return {boolean} {@link false} if it wrote a pointer to a previous instance, {@link true} if it wrote the type byte. For internal use.
     */
    addToBuffer(buffer: GrowableBuffer): boolean;
    /**
     * Gets the type in buffer form, using a cached value if present.
     * Since types are immutable, the result should never change from the cached value.
     * @return {external:ArrayBuffer} A Buffer containing the type bytes
     */
    toBuffer(): ArrayBuffer;
    /**
     * Gets an SHA256 hash of the type, using a cached value if present
     * @return {string} a hash of the buffer given by [toBuffer()]{@link Type#toBuffer}
     */
    getHash(): string;
    /**
     * Gets a signature string for the type, using a cached value if present.
     * This string encodes the specification version and the type hash.
     * @return {string} a signature for the type
     */
    getSignature(): string;
    /**
     * Appends value bytes to a {@link GrowableBuffer} according to the type
     * @param {GrowableBuffer} buffer The buffer to which to append
     * @param {*} value The value to write
     * @throws {Error} If called on the {@link Type} class
     * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
     */
    writeValue(buffer: GrowableBuffer, value: VALUE, root?: boolean): void;
    /**
     * Gets a {@link Buffer} containing the value in binary format.
     * See this type's {@link writeValue()} documentation
     * for acceptable values.
     * @param {*} value The value to write
     * @return {external:ArrayBuffer} a {@link Buffer} storing the value (assuming the type is known)
     * @see Type#writeValue
     */
    valueBuffer(value: VALUE): ArrayBuffer;
    /**
     * Returns whether this type object represents the same type as another object
     * @param {Type} otherType Another object to compare with
     * @return {boolean} {@link true} iff the types have the same constructor and the same field values for fields that don't store cached results
     */
    equals(otherType: any): boolean;
}
