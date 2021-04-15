import type {AppendableBuffer} from './appendable'
import * as assert from './assert'

const INITIAL_LENGTH = 10

export const asUint8Array = (buffer: ArrayBuffer | Uint8Array): Uint8Array =>
	buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
export function toArrayBuffer(buffer: Uint8Array): ArrayBuffer {
	const {buffer: arrayBuffer, byteOffset, byteLength} = buffer
	return !byteOffset && byteLength === arrayBuffer.byteLength
		? arrayBuffer // if Buffer occupies whole ArrayBuffer, no need to slice it
		: arrayBuffer.slice(byteOffset, byteOffset + byteLength)
}

/**
 * A [`StringBuilder`](https://docs.oracle.com/javase/8/docs/api/java/lang/StringBuilder.html)-like
 * object which automatically grows its internal buffer as bytes are added.
 * Uses an `ArrayBuffer` to store the binary data.
 * Used extensively throughout the project for building up buffers.
 * See [[GrowableBuffer.grow]] for an explanation of the growing process.
 */
export default class GrowableBuffer implements AppendableBuffer {
	private buffer: ArrayBuffer
	private size: number
	//A stack, containing lengths when buffer was paused
	private readonly pausePoints: number[]

	/**
	 * @param initialLength
	 * The number of bytes in the internal buffer at start
	 * (defaults to 10)
	 */
	constructor(initialLength = INITIAL_LENGTH) {
		try {
			assert.integer(initialLength)
			assert.between(0, initialLength, Infinity)
		}
		catch { throw new RangeError(`${initialLength} is not a valid buffer length`) }
		this.buffer = new ArrayBuffer(initialLength)
		this.size = 0
		this.pausePoints = []
	}

	/**
	 * The current number of bytes being occupied.
	 * Note that this is NOT the size of the internal buffer.
	 */
	get length(): number {
		return this.size
	}
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
	grow(size: number): this {
		assert.integer(size)
		if (size > this.buffer.byteLength) { //if resizing is necessary
			const newBuffer = new ArrayBuffer(size << 1)
			new Uint8Array(newBuffer).set(new Uint8Array(this.buffer))
			this.buffer = newBuffer
		}
		return this
	}
	/**
	 * Adds a byte after the end of the
	 * occupied portion of the internal buffer
	 * @param value The unsigned byte value to add
	 */
	add(value: number): this {
		assert.integer(value)
		assert.between(0, value, 0x100, `Not a byte: ${value}`)
		return this.addAll(new Uint8Array([value]).buffer)
	}
	/**
	 * Adds a contiguous set of bytes after
	 * the end of the occupied portion
	 * of the internal buffer
	 * @param buffer The bytes to add.
	 * The byte at position `i` in `buffer` will be written to
	 * position `this.length + i` of the [[GrowableBuffer]]).
	 */
	addAll(buffer: ArrayBuffer | Uint8Array): this {
		assert.instanceOf(buffer, [ArrayBuffer, Uint8Array])
		const oldSize = this.size
		const newSize = this.size + buffer.byteLength
		this.grow(newSize)
		this.size = newSize
		new Uint8Array(this.buffer).set(asUint8Array(buffer), oldSize)
		return this
	}
	/**
	 * Gets the occupied portion in `ArrayBuffer` form
	 * @return The internal buffer trimmed to `this.length`
	 */
	toBuffer(): ArrayBuffer {
		return toArrayBuffer(this.toUint8Array())
	}
	/**
	 * Gets the occupied portion in `Uint8Array` form
	 * @return The internal buffer trimmed to `this.length`
	 */
	toUint8Array(): Uint8Array {
		let [pausePoint] = this.pausePoints as [number?]
		if (pausePoint === undefined) pausePoint = this.size
		return new Uint8Array(this.buffer, 0, pausePoint)
	}
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
	pause(): this {
		this.pausePoints.push(this.size)
		return this
	}
	/**
	 * See [[pause]].
	 * Flushes all paused data to the output
	 * and exits paused mode.
	 * @throws If not currently paused
	 */
	resume(): this {
		if (this.pausePoints.pop() === undefined) throw new Error('Was not paused')
		return this
	}
	/**
	 * See [[pause]].
	 * Restores state to immediately after
	 * this [[AppendableBuffer]] was paused.
	 * Prevents paused data from ever
	 * being flushed to the output.
	 * @throws If not currently paused
	 */
	reset(): this {
		const [pausePoint] = this.pausePoints.slice(-1) as [number | undefined]
		if (pausePoint === undefined) throw new Error('Was not paused')
		this.size = pausePoint
		return this
	}
}