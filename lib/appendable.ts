/**
 * A "writable" interface, sufficient
 * to be able to write type and value bytes.
 * Implemented by [[GrowableBuffer]], as well as
 * [[AppendableStream]] (a wrapper around a writable stream).
 * All methods can be chained, e.g.
 * ````javascript
 * let gb = new GrowableBuffer
 * gb
 *   .add(1).add(2)
 *   .addAll(new Uint8Array([3, 4, 5]))
 *   .pause()
 *     .add(0)
 *     .reset()
 *   .resume()
 * console.log(new Uint8Array(gb.toBuffer())) //Uint8Array [ 1, 2, 3, 4, 5 ]
 * ````
 */
export abstract class AppendableBuffer {
	/**
	 * The number of bytes that have been written
	 */
	abstract readonly length: number
	/**
	 * Adds a byte after the end
	 * of the written data
	 * @param value The unsigned byte value to add
	 */
	abstract add(value: number): this
	/**
	 * Adds a contiguous set of bytes
	 * after the end of the written data
	 * @param buffer The bytes to add.
	 * The byte at position `i` in `buffer` will be written to
	 * position `this.length + i`.
	 */
	abstract addAll(buffer: ArrayBuffer | Uint8Array): this
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
	 *     .resume() //resumes []
	 *   .resume() //resumes [1, 2, 3]
	 * console.log(new Uint8Array(gb.toBuffer())) //Uint8Array [ 1, 2, 3 ]
	 * ````
	 */
	abstract pause(): this
	/**
	 * See [[pause]].
	 * Flushes all paused data to the output
	 * and exits paused mode.
	 * @throws If not currently paused
	 */
	abstract resume(): this
	/**
	 * See [[pause]].
	 * Restores state to immediately after
	 * this [[AppendableBuffer]] was paused.
	 * Prevents paused data from ever
	 * being flushed to the output.
	 * @throws If not currently paused
	 */
	abstract reset(): this
}