import assert from './assert'
import GrowableBuffer from './growable-buffer'
import {Readable} from 'stream'

/**
 * A class for creating a readable stream
 * out of an `ArrayBuffer`
 * or a [[GrowableBuffer]].
 * When dealing with very large buffers,
 * this allows chunks to be sent as they are requested
 * rather than stuffing the whole buffer into the stream at once.
 * The stream is intended mainly to be piped
 * into write streams.
 */
export default class BufferStream extends Readable {
	private readonly buffer: ArrayBuffer
	private readonly end: number
	private offset: number
	/**
	 * @param buffer
	 * The buffer whose data to use.
	 * If a [[GrowableBuffer]] is used, only the
	 * occupied portion will be written by the stream.
	 * Future additions to the [[GrowableBuffer]]
	 * will not be written.
	 * If bytes inside the `ArrayBuffer`
	 * or occupied portion are changed, behavior is undefined.
	 */
	constructor(buffer: ArrayBuffer | GrowableBuffer) {
		super()
		if (buffer && buffer.constructor === ArrayBuffer) {
			this.buffer = buffer as ArrayBuffer
			this.end = (buffer as ArrayBuffer).byteLength
		}
		else if (buffer && buffer.constructor === GrowableBuffer) {
			this.buffer = (buffer as GrowableBuffer).rawBuffer
			this.end = (buffer as GrowableBuffer).length //end earlier than the end of the raw buffer
		}
		else {
			assert.fail(
				'Expected ArrayBuffer or GrowableBuffer, got ' +
				(buffer ? buffer.constructor.name : String(buffer)) //buffer should always have a constructor if it is neither undefined nor null
			)
		}
		this.offset = 0
	}
	_read(size: number) {
		if (this.offset < this.end) {
			this.push(Buffer.from(this.buffer.slice(this.offset, Math.min(this.offset + size, this.end))))
			this.offset += size
		}
		else {
			this.push(null)
			this.emit('bs-written')
		}
	}
}