const assert = require(__dirname + '/assert.js');

const INITIAL_LENGTH = 10;

module.exports = class GrowableBuffer {
	constructor(initialLength = INITIAL_LENGTH) {
		assert.integer(initialLength);
		assert.between(0, initialLength, Number.MAX_SAFE_INTEGER, String(initialLength) + ' is not a valid buffer length');
		this.buffer = Buffer.allocUnsafe(initialLength);
		this.size = 0;
	}

	get length() {
		return this.size;
	}
	grow(size) {
		assert.integer(size);
		if (size > this.buffer.length) {
			let newBuffer = Buffer.allocUnsafe(size << 1);
			this.buffer.copy(newBuffer, 0, 0, this.size);
			this.buffer = newBuffer;
		}
		return this;
	}
	set(index, value) {
		assert.integer(index);
		assert.integer(value);
		assert.between(0, index, this.size, 'Index out of bounds: ');
		assert.between(0, value, 0x100, 'Not a byte: ');
		this.buffer[index] = value;
		return this;
	}
	setAll(index, buffer) {
		assert.instanceOf(buffer, Buffer);
		assert.integer(index);
		assert.between(0, index, this.size - buffer.length + 1, 'Index out of bounds: ');
		buffer.copy(this.buffer, index);
	}
	get(index) {
		assert.integer(index);
		assert.between(0, index, this.size, 'Index out of bounds: ');
		return this.buffer[index];
	}
	add(value) {
		let oldSize = this.size;
		let newSize = oldSize + 1;
		this.grow(newSize);
		this.size = newSize;
		this.set(oldSize, value);
		return this;
	}
	addAll(buffer) {
		assert.instanceOf(buffer, Buffer);
		let oldSize = this.size;
		let newSize = this.size + buffer.length;
		this.grow(newSize);
		this.size = newSize;
		buffer.copy(this.buffer, oldSize);
		return this;
	}
	get rawBuffer() {
		return this.buffer;
	}
	toBuffer() {
		return this.buffer.slice(0, this.size);
	}
};