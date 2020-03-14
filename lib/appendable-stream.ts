import {OutgoingMessage} from 'http'
import {Duplex, Writable} from 'stream'
import type {AppendableBuffer} from './appendable'
import * as assert from './assert'
import GrowableBuffer from './growable-buffer'

const WRITABLE_STREAMS = [Writable, Duplex, OutgoingMessage]

/**
 * A wrapper around a writable stream
 * to implement [[AppendableBuffer]].
 * The stream must be explicitly closed
 * by calling [[end]] after all bytes
 * have been written.
 */
export default class AppendableStream implements AppendableBuffer {
	private readonly outStream: Writable
	private writtenBytes: number
	private pauseCount: number //number of pauses deep in the pause stack
	private paused: GrowableBuffer

	/**
	 * @param outStream The underlying writable stream
	 */
	constructor(outStream: Writable) {
		assert.instanceOf(outStream, WRITABLE_STREAMS)
		this.outStream = outStream
		this.writtenBytes = 0
		this.pauseCount = 0
		this.paused = new GrowableBuffer
	}

	/**
	 * Appends a byte to the end
	 * of the written data
	 * @param value The unsigned byte value to add
	 */
	add(value: number) {
		assert.integer(value)
		assert.between(0, value, 0x100, `Not a byte: ${value}`)
		return this.addAll(new Uint8Array([value]))
	}
	/**
	 * Appends a contiguous set of bytes
	 * to the end of the written data
	 * @param buffer The bytes to add
	 */
	addAll(buffer: ArrayBuffer | Uint8Array) {
		assert.instanceOf(buffer, [ArrayBuffer, Uint8Array])
		if (this.pauseCount) this.paused.addAll(buffer)
		else this.outStream.write(Buffer.from(buffer))
		this.writtenBytes += buffer.byteLength
		return this
	}
	/**
	 * Closes the underlying stream
	 */
	end(): void {
		this.outStream.end()
	}
	/**
	 * The number of bytes that have been written
	 */
	get length() {
		return this.writtenBytes
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
	pause() {
		this.paused.pause()
		this.pauseCount++
		return this
	}
	/**
	 * See [[pause]].
	 * Flushes all paused data to the output
	 * and exits paused mode.
	 * @throws If not currently paused
	 */
	resume() {
		if (!this.pauseCount) throw new Error('Was not paused')
		this.pauseCount--
		this.paused.resume()
		if (!this.pauseCount) { //emptied pause stack
			this.outStream.write(this.paused.toUint8Array())
			this.paused = new GrowableBuffer //must use a new buffer to avoid overwriting data sent to outStream
		}
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
	reset() {
		if (!this.pauseCount) throw new Error('Was not paused')
		const lengthBeforeReset = this.paused.length
		this.paused.reset()
		const lengthAfterReset = this.paused.length
		this.writtenBytes -= lengthBeforeReset - lengthAfterReset
		return this
	}
}