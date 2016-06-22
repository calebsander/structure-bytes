function assertInstanceOf(instance, constructor) {
	if (instance.constructor !== constructor) throw new Error(String(instance) + ' is not an instance of ' + constructor.name);
}
function assertInteger(instance) {
	assertInstanceOf(instance, Number);
	if (!Number.isInteger(instance)) throw new Error(String(instance) + ' is not an integer');
}
function assertBetween(lower, value, upper, message) {
	if (value < lower || value >= upper) throw new Error((message || '') + (String(value) + ' is not in [' + String(lower) + ',' + String(upper) + ')'));
}

const INITIAL_LENGTH = 10;

module.exports = class GrowableBuffer {
	constructor(initialLength = INITIAL_LENGTH) {
		assertInteger(initialLength);
		this.buffer = Buffer.allocUnsafe(initialLength);
		this.size = 0;
	}

	get length() {
		return this.size;
	}
	grow(size) {
		assertInteger(size);
		if (size > this.buffer.length) {
			let newBuffer = Buffer.allocUnsafe(size << 1);
			this.buffer.copy(newBuffer, 0, 0, this.size);
			this.buffer = newBuffer;
		}
	}
	set(index, value) {
		assertInteger(index);
		assertInteger(value);
		assertBetween(0, index, this.size, 'Index out of bounds: ');
		assertBetween(0, value, 0x100, 'Not a byte: ');
		this.buffer[index] = value;
	}
	get(index) {
		assertInteger(index);
		assertBetween(0, index, this.size, 'Index out of bounds: ');
		return this.buffer[index];
	}
	add(value) {
		let oldSize = this.size;
		let newSize = oldSize + 1;
		this.grow(newSize);
		this.size = newSize;
		this.set(oldSize, value);
	}
	addAll(buffer) {
		assertInstanceOf(buffer, Buffer);
		let oldSize = this.size;
		let newSize = this.size + buffer.length;
		this.grow(newSize);
		this.size = newSize;
		buffer.copy(this.buffer, oldSize);
	}
};