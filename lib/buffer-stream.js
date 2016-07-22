const assert = require(__dirname + '/assert.js');
const GrowableBuffer = require(__dirname + '/growable-buffer.js');
const stream = require('stream');

/**
 * A class for creating a readable stream
 * out of a [Buffer]{@link external:Buffer} or {@link GrowableBuffer}.
 * When dealing with very large buffers,
 * this allows chunks to be sent as they are requested
 * rather than stuffing the whole buffer into the stream at once.
 * The stream is intended mainly to be piped
 * into write streams.
 */
class BufferStream extends stream.Readable {
	/**
	 * @param {external:Buffer|GrowableBuffer} buffer
	 * The buffer whose data to use.
	 * If a {@link GrowableBuffer} is used, only the
	 * occupied portion will be written by the stream.
	 * Future additions to the {@link GrowableBuffer}
	 * will not be written.
	 * If bytes inside the [Buffer]{@link external:Buffer}
	 * or occupied portion are changed, behavior is undefined.
	 */
	constructor(buffer) {
		super();
		if (Buffer.isBuffer(buffer)) this.buffer = buffer;
		else if (buffer && buffer.constructor === GrowableBuffer) this.buffer = buffer.rawBuffer;
		else assert.fail('Expected Buffer, got ' + (buffer ? buffer.constructor.name : String(buffer))); //buffer should always have a constructor if it is neither undefined nor null
		this.offset = 0;
		this.end = buffer.length;
	}
	_read(size) {
		if (this.offset < this.end) {
			this.push(this.buffer.slice(this.offset, Math.min(this.offset + size, this.end)));
			this.offset += size;
		}
		else {
			this.push(null);
			this.emit('bs-written');
		}
	}
}

module.exports = BufferStream;