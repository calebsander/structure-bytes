const assert = require('./assert')
const GrowableBuffer = require('./growable-buffer')
const stream = require('stream')

/**
 * A class for creating a readable stream
 * out of an [ArrayBuffer]{@link external:ArrayBuffer}
 * or a {@link GrowableBuffer}.
 * When dealing with very large buffers,
 * this allows chunks to be sent as they are requested
 * rather than stuffing the whole buffer into the stream at once.
 * The stream is intended mainly to be piped
 * into write streams.
 */
class BufferStream extends stream.Readable {
	/**
	 * @param {external:ArrayBuffer|GrowableBuffer} buffer
	 * The buffer whose data to use.
	 * If a {@link GrowableBuffer} is used, only the
	 * occupied portion will be written by the stream.
	 * Future additions to the {@link GrowableBuffer}
	 * will not be written.
	 * If bytes inside the [ArrayBuffer]{@link external:ArrayBuffer}
	 * or occupied portion are changed, behavior is undefined.
	 */
	constructor(buffer) {
		super()
		if (buffer && buffer.constructor === ArrayBuffer) {
			this.buffer = buffer
			this.end = buffer.byteLength
		}
		else if (buffer && buffer.constructor === GrowableBuffer) {
			this.buffer = buffer.rawBuffer
			this.end = buffer.length //end earlier than the end of the raw buffer
		}
		else assert.fail('Expected ArrayBuffer or GrowableBuffer, got ' + (buffer ? buffer.constructor.name : String(buffer))) //buffer should always have a constructor if it is neither undefined nor null
		this.offset = 0
	}
	_read(size) {
		if (this.offset < this.end) {
			this.push(Buffer.from(this.buffer.slice(this.offset, Math.min(this.offset + size, this.end)))) //slice behaves nicely when going past the end of the buffer
			this.offset += size
		}
		else {
			this.push(null)
			this.emit('bs-written')
		}
	}
}

module.exports = BufferStream