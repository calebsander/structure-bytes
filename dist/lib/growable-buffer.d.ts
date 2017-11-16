import AppendableBuffer from './appendable';
/**
 * A [`StringBuilder`](https://docs.oracle.com/javase/8/docs/api/java/lang/StringBuilder.html)-like
 * object which automatically grows its internal buffer as bytes are added.
 * Uses an `ArrayBuffer` to store the binary data.
 * Used extensively throughout the project for building up buffers.
 * See [[GrowableBuffer.grow]] for an explanation of the growing process.
 */
export default class GrowableBuffer extends AppendableBuffer {
    private buffer;
    private size;
    private readonly pausePoints;
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
     * position `this.length + i` of the [[GrowableBuffer]]).
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
    /**
     * Pauses the writing process, i.e.
     * bytes added are not written
     * to the underlying output until
     * [[resume]] is next called and
     * can be cancelled from being written
     * by calling [[reset]].
     *
     * If called multiple times, [[resume]]
     * and [[reset]] only act on bytes added
     * since the most recent pause. Example:
     * ````javascript
     * let gb = new GrowableBuffer
     * gb
     *   .pause()
     *     .add(1).add(2).add(3)
     *     .pause()
     *       .add(4).add(5).add(6)
     *       .reset() //cancels [4, 5, 6]
     *     .resume()
     *   .resume() //resumes [1, 2, 3]
     * console.log(new Uint8Array(gb.toBuffer())) //Uint8Array [ 1, 2, 3 ]
     * ````
     */
    pause(): this;
    /**
     * See [[pause]].
     * Flushes all paused data to the output
     * and exits paused mode.
     * @throws If not currently paused
     */
    resume(): this;
    /**
     * See [[pause]].
     * Restores state to immediately after
     * this [[AppendableBuffer]] was paused.
     * Prevents paused data from ever
     * being flushed to the output.
     * @throws If not currently paused
     */
    reset(): this;
}
