import {OutgoingMessage} from 'http'
import {Duplex, Writable} from 'stream'
import AppendableBuffer from './appendable'
import assert from './assert'

const WRITABLE_STREAMS = [Writable, Duplex, OutgoingMessage]

/**
 * A wrapper around a writable stream
 * to implement [[AppendableBuffer]].
 * The stream must be explicitly closed
 * by calling [[AppendableStream.end]]
 * after all bytes have been written.
 */
export default class AppendableStream implements AppendableBuffer {
	private readonly outStream: Writable
	private writtenBytes: number

	/**
	 * @param outStream The underlying writable stream
	 */
	constructor(outStream: Writable) {
		assert.instanceOf(outStream, WRITABLE_STREAMS)
		this.outStream = outStream
		this.writtenBytes = 0
	}

	/**
	 * Appends a byte to the end
	 * of the written data
	 * @param value The unsigned byte value to add
	 */
	add(value: number): this {
		assert.integer(value)
		assert.between(0, value, 0x100, 'Not a byte: ' + String(value))
		this.outStream.write(Buffer.from([value]))
		this.writtenBytes++
		return this
	}
	/**
	 * Appends a contiguous set of bytes
	 * to the end of the written data
	 * @param buffer The bytes to add
	 */
	addAll(buffer: ArrayBuffer): this {
		assert.instanceOf(buffer, ArrayBuffer)
		this.outStream.write(Buffer.from(buffer))
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
	get length(): number {
		return this.writtenBytes
	}
}