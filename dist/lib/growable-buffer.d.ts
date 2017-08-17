/**
 * A {@link StringBuilder}-like object which
 * automatically grows its internal buffer
 * as bytes are added.
 * Uses an [ArrayBuffer]{@link external:ArrayBuffer}
 * to store the binary data.
 * Used extensively throughout the project
 * for building up buffers.
 * @see GrowableBuffer#grow
 * for explanation of the growing process
 */
export default class GrowableBuffer {
    private buffer;
    private size;
    /**
     * @param {number} [initialLength=10]
     * The number of bytes in the internal buffer at start
     */
    constructor(initialLength?: number);
    /**
     * The current number of bytes being occupied.
     * Note that this is NOT the size of the internal buffer.
     * @readonly
     * @type {number}
     */
    readonly length: number;
    /**
     * Grow the internal buffer to hold
     * at least the specified number of bytes.
     * If the internal buffer is too small,
     * it will be resized to {@link size*2}.
     * If the buffer is already sufficiently long, nothing happens.
     * This is called internally when needed,
     * but if a program knows it will need a lot of space eventually,
     * this method can be called explicitly.
     * @param {number} size An inclusive lower bound on the number of bytes
     * in the internal buffer after the method returns
     * @return {GrowableBuffer} {@link this}
     */
    grow(size: number): this;
    /**
     * Sets a byte's value.
     * The byte must lie in the occupied portion
     * of the internal buffer.
     * @param {number} index The position of the byte (0-indexed)
     * @param {number} value The value to set the byte to
     * (must fit in an unsigned byte)
     * @return {GrowableBuffer} {@link this}
     */
    set(index: number, value: number): this;
    /**
     * Sets a set of contiguous bytes' values.
     * Each byte must lie in the occupied portion
     * of the internal buffer.
     * @param {number} index The position of the first byte (0-indexed)
     * @param {external:ArrayBuffer} buffer The values to write, starting at {@link index}
     * (the byte at position {@link i} in {@link buffer} will be written to
     * position {@link index+i} of the {@link GrowableBuffer})
     * @return {GrowableBuffer} {@link this}
     */
    setAll(index: number, buffer: ArrayBuffer): this;
    /**
     * Gets a byte's value.
     * The byte must lie in the occupied portion
     * of the internal buffer.
     * @param {number} index The position of the byte (0-indexed)
     * @return {number} the unsigned byte at the specified index
     * of the internal buffer
     */
    get(index: number): number;
    /**
     * Adds a byte after the end of the
     * occupied portion of the internal buffer
     * @param {number} value The unsigned byte value to add
     * @return {GrowableBuffer} {@link this}
     */
    add(value: number): this;
    /**
     * Adds a contiguous set of bytes after
     * the end of the occupied portion
     * of the internal buffer
     * @param {external:ArrayBuffer} buffer The bytes to add
     * the byte at position {@link i} in {@link buffer} will be written to
     * position {@link this.length+i} of the {@link GrowableBuffer})
     * @return {GrowableBuffer} {@link this}
     */
    addAll(buffer: ArrayBuffer): this;
    /**
     * Gets the internal buffer to avoid calling {@link ArrayBuffer#slice}
     * @private
     * @readonly
     * @type {external:ArrayBuffer}
     */
    readonly rawBuffer: ArrayBuffer;
    /**
     * Gets the occupied portion in {@link ArrayBuffer} form.
     * @return {external:ArrayBuffer} The internal buffer trimmed to
     * [this.length]{@link GrowableBuffer#length}
     */
    toBuffer(): ArrayBuffer;
}
