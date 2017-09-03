/**
 * A [`StringBuilder`](https://docs.oracle.com/javase/8/docs/api/java/lang/StringBuilder.html)-like
 * object which automatically grows its internal buffer as bytes are added.
 * Uses an `ArrayBuffer` to store the binary data.
 * Used extensively throughout the project for building up buffers.
 * See [[GrowableBuffer.grow]] for an explanation of the growing process.
 */
export default class GrowableBuffer {
    private buffer;
    private size;
    /**
     * @param initialLength
     * The number of bytes in the internal buffer at start
     * (defaults to 10)
     */
    constructor(initialLength?: number);
    /**
     * The current number of bytes being occupied.
     * Note that this is NOT the size of the internal buffer.
     */
    readonly length: number;
    /**
     * Grow the internal buffer to hold
     * at least the specified number of bytes.
     * If the internal buffer is too small,
     * it will be resized to `size * 2`.
     * If the buffer is already sufficiently long, nothing happens.
     * This is called internally when needed,
     * but if a program knows it will need a lot of space eventually,
     * this method can be called explicitly to avoid unnecessary copying.
     * @param size An inclusive lower bound on the number of bytes
     * in the internal buffer after the method returns
     */
    grow(size: number): this;
    /**
     * Sets a byte's value.
     * The byte must lie in the occupied portion
     * of the internal buffer.
     * @param index The position of the byte (0-indexed)
     * @param value The value to set the byte to
     * (must fit in an unsigned byte)
     */
    set(index: number, value: number): this;
    /**
     * Sets a set of contiguous bytes' values.
     * Each byte must lie in the occupied portion
     * of the internal buffer.
     * @param index The position of the first byte (0-indexed)
     * @param buffer The values to write, starting at `index`
     * (the byte at position `i` in `buffer` will be written to
     * position `index + i` of the [[GrowableBuffer]])
     */
    setAll(index: number, buffer: ArrayBuffer): this;
    /**
     * Gets a byte's value.
     * The byte must lie in the occupied portion
     * of the internal buffer.
     * @param index The position of the byte (0-indexed)
     * @return The unsigned byte at the specified index
     * of the internal buffer
     */
    get(index: number): number;
    /**
     * Adds a byte after the end of the
     * occupied portion of the internal buffer
     * @param value The unsigned byte value to add
     */
    add(value: number): this;
    /**
     * Adds a contiguous set of bytes after
     * the end of the occupied portion
     * of the internal buffer
     * @param buffer The bytes to add.
     * The byte at position `i` in `buffer` will be written to
     * position `this.length + i` of the [[GrowableBuffer]])
     */
    addAll(buffer: ArrayBuffer): this;
    /**
     * Gets the internal buffer to avoid calling `ArrayBuffer.slice()`
     * @private
     */
    readonly rawBuffer: ArrayBuffer;
    /**
     * Gets the occupied portion in `ArrayBuffer` form
     * @return The internal buffer trimmed to `this.length`
     */
    toBuffer(): ArrayBuffer;
}
