import {OutgoingMessage} from 'http'
import {Duplex, Writable} from 'stream'
import AppendableBuffer from './appendable'
import assert from './assert'
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
	private paused: GrowableBuffer | null

	/**
	 * @param outStream The underlying writable stream
	 */
	constructor(outStream: Writable) {
		assert.instanceOf(outStream, WRITABLE_STREAMS)
		this.outStream = outStream
		this.writtenBytes = 0
		this.paused = null
	}

	/**
	 * Appends a byte to the end
	 * of the written data
	 * @param value The unsigned byte value to add
	 */
	add(value: number) {
		assert.integer(value)
		assert.between(0, value, 0x100, 'Not a byte: ' + String(value))
		return this.addAll(new Uint8Array([value]).buffer)
	}
	/**
	 * Appends a contiguous set of bytes
	 * to the end of the written data
	 * @param buffer The bytes to add
	 */
	addAll(buffer: ArrayBuffer) {
		assert.instanceOf(buffer, ArrayBuffer)
		if (this.paused) this.paused.addAll(buffer)
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
	 * @throws If paused earlier and never resumed
	 */
	pause() {
		assert(this.paused === null, 'Already paused')
		this.paused = new GrowableBuffer
		return this
	}
	/**
	 * See [[pause]].
	 * Flushes all paused data to the output
	 * and exits paused mode.
	 * @throws If not currently paused
	 */
	resume() {
		if (!this.paused) throw new Error('Was not paused')
		const {length} = this.paused
		this.outStream.write(Buffer.from(this.paused.rawBuffer, 0, length))
		this.paused = null
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
		if (!this.paused) throw new Error('Was not paused')
		this.writtenBytes -= this.paused.length
		this.paused = new GrowableBuffer
		return this
	}
}