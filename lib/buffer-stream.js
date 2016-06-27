const assert = require(__dirname + '/assert.js');
const GrowableBuffer = require(__dirname + '/growable-buffer.js');
const stream = require('stream');

class BufferStream extends stream.Readable {
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
		else this.push(null);
	}
}

module.exports = BufferStream;