import type {AppendableBuffer} from '../lib/appendable'
import type {BufferOffset} from '../lib/read-util'

/**
 * An interface representing an object that can serialize values of a certain type.
 * The object must also be able to serialize itself.
 * @param VALUE The type of values this object can serialize
 * @param READ_VALUE The type of values this object deserializes.
 * Must be a subset of `VALUE`. Defaults to `VALUE`.
 */
export interface Type<VALUE, READ_VALUE extends VALUE = VALUE> {
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
	 * Reads a value from the specified bytes
	 * at the specified offset.
	 * Returns the value that was read
	 * and the number of bytes consumed.
	 * @param buffer The buffer containing the value bytes
	 * @param offset The position in the buffer to read from
	 * @param baseValue A value to mutate into the read value.
	 * Used by [[RecursiveType]].
	 * @return The read value and the number of bytes read
	 */
	consumeValue(bufferOffset: BufferOffset, baseValue?: unknown): READ_VALUE
	/**
	 * Deserializes a value, i.e. takes
	 * a buffer containing its binary form
	 * and returns the value.
	 * The inverse of [[valueBuffer]].
	 * Requires the type (`this`) to be known.
	 *
	 * Example:
	 * ````javascript
	 * let type = new sb.ArrayType(
	 *   new sb.FlexUnsignedIntType
	 * )
	 * let value = [0, 10, 100, 1000, 10000]
	 * let buffer = type.valueBuffer(value)
	 * let readValue = type.readValue(buffer)
	 * console.log(readValue) // [ 0, 10, 100, 1000, 10000 ]
	 * ````
	 *
	 * @param buffer The buffer containing the value bytes
	 * @param offset The position in the buffer to read from
	 * (defaults to `0`)
	 * @return A value equivalent to the one that was written
	 * @throws If the value does not occupy all of the buffer
	 * from index `offset` to the end
	 */
	readValue(buffer: ArrayBuffer | Uint8Array, offset?: number): READ_VALUE
	/**
	 * Returns whether this type object represents the same type as another object
	 * @param otherType Another object to compare with
	 * @return `true` iff the types would be serialized to the same bytes
	 */
	equals(otherType: unknown): boolean
}