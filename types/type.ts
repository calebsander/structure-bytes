import AppendableBuffer from '../lib/appendable'

/**
 * An interface representing an object that can serialize values of a certain type.
 * The object must also be able to serialize itself.
 * @param VALUE The type of values this object can serialize
 */
export default interface Type<VALUE> {
	/**
	 * Appends the type information to an [[AppendableBuffer]]
	 * @param buffer The buffer to append to
	 * @return `false` if it wrote a pointer to a previous instance, `true` if it wrote the type byte. For internal use.
	 */
	addToBuffer(buffer: AppendableBuffer): boolean
	/**
	 * Gets the type in buffer form, using a cached value if present.
	 * Since types are immutable, the result should never change from the cached value.
	 * @return A buffer containing the type bytes
	 */
	toBuffer(): ArrayBuffer
	/**
	 * Gets a base-64 SHA256 hash of the type, using a cached value if present
	 * @return A hash of the buffer given by [[toBuffer]]
	 */
	getHash(): string
	/**
	 * Gets a signature string for the type, using a cached value if present.
	 * This string encodes the specification version and the type hash.
	 * Represented as a base-64 string.
	 * @return A signature for the type
	 */
	getSignature(): string
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: VALUE): void
	/**
	 * Gets an `ArrayBuffer` containing the value in binary format.
	 * See this type's [[writeValue]] documentation for examples of values.
	 * @param value The value to write
	 * @return An `ArrayBuffer` storing the value
	 */
	valueBuffer(value: VALUE): ArrayBuffer
	/**
	 * Returns whether this type object represents the same type as another object
	 * @param otherType Another object to compare with
	 * @return `true` iff the types would be serialized to the same bytes
	 */
	equals(otherType: any): boolean
}