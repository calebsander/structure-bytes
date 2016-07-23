const assert = require(__dirname + '/assert.js');

const INITIAL_LENGTH = 10;

/**
 * A {@link StringBuilder}-like object which
 * automatically grows its internal buffer
 * as bytes are added.
 * Used extensively throughout the project
 * for building up buffers.
 * @see GrowableBuffer#grow
 * for explanation of the growing process
 */
class GrowableBuffer {
	/**
	 * @param {number} [initialLength=10]
	 * The number of bytes in the internal buffer at start
	 */
	constructor(initialLength = INITIAL_LENGTH) {
		try {
			assert.integer(initialLength);
			assert.between(0, initialLength, Number.MAX_SAFE_INTEGER + 1);
		}
		catch (e) { throw new RangeError(String(initialLength) + ' is not a valid buffer length') } //eslint-disable-line semi
		this.buffer = Buffer.allocUnsafe(initialLength);
		this.size = 0;
	}

	/**
	 * The current number of bytes being occupied.
	 * Note that this is NOT the size of the internal buffer.
	 * @readonly
	 * @type number
	 */
	get length() {
		return this.size;
	}
	/**
	 * Grow the internal buffer to hold
	 * at least the specified number of bytes.
	 * If the internal buffer is too small,
	 * it will be resized to {@link size*2}
	 * This is called internally when needed,
	 * but if the program knows it will need a lot of space eventually,
	 * this method can be called explicitly.
	 * @param {number} size An inclusive lower bound on the number of bytes
	 * in the internal buffer after the method returns
	 * @return {GrowableBuffer} {@link this}
	 */
	grow(size) {
		assert.integer(size);
		if (size > this.buffer.length) {
			const newBuffer = Buffer.allocUnsafe(size << 1);
			this.buffer.copy(newBuffer, 0, 0, this.size);
			this.buffer = newBuffer;
		}
		return this;
	}
	/**
	 * Sets a byte's value.
	 * The byte must lie in the occupied portion
	 * of the internal buffer.
	 * @param {number} index The position of the byte (0-indexed)
	 * @param {number} value The value to set the byte to
	 * (must fit in an unsigned byte)
	 * @return {GrowableBuffer} {@link this}
	 */
	set(index, value) {
		assert.integer(index);
		assert.integer(value);
		assert.between(0, index, this.size, 'Index out of bounds: ' + String(index));
		assert.between(0, value, 0x100, 'Not a byte: ' + String(value));
		this.buffer.writeUInt8(value, index);
		return this;
	}
	/**
	 * Sets a set of contiguous bytes' values.
	 * Each byte must lie in the occupied portion
	 * of the internal buffer.
	 * @param {number} index The position of the first byte (0-indexed)
	 * @param {external:Buffer} buffer The values to write, starting at {@link index}
	 * (the byte at position {@link i} in {@link buffer} will be written to
	 * position {@link index+i} of the {@link GrowableBuffer})
	 * @return {GrowableBuffer} {@link this}
	 */
	setAll(index, buffer) {
		assert.instanceOf(buffer, Buffer);
		assert.integer(index);
		assert.between(0, index, this.size - buffer.length + 1, 'Index out of bounds: ' + String(index));
		buffer.copy(this.buffer, index);
	}
	/**
	 * Gets a byte's value.
	 * The byte must lie in the occupied portion
	 * of the internal buffer.
	 * @param {number} index The position of the byte (0-indexed)
	 * @return {number} the unsigned byte at the specified index
	 * of the internal buffer
	 */
	get(index) {
		assert.integer(index);
		assert.between(0, index, this.size, 'Index out of bounds: ' + String(index));
		return this.buffer.readUInt8(index);
	}
	/**
	 * Adds a byte after the end of the
	 * occupied portion of the internal buffer
	 * @param {number} value The unsigned byte value to add
	 * @return {GrowableBuffer} {@link this}
	 */
	add(value) {
		const oldSize = this.size;
		const newSize = oldSize + 1;
		this.grow(newSize);
		this.size = newSize;
		this.set(oldSize, value);
		return this;
	}
	/**
	 * Adds a contiguous set of bytes after
	 * the end of the occupied portion
	 * of the internal buffer
	 * @param {external:Buffer} buffer The bytes to add
	 * the byte at position {@link i} in {@link buffer} will be written to
	 * position {@link this.length+i} of the {@link GrowableBuffer})
	 * @return {GrowableBuffer} {@link this}
	 */
	addAll(buffer) {
		assert.instanceOf(buffer, Buffer);
		const oldSize = this.size;
		const newSize = this.size + buffer.length;
		this.grow(newSize);
		this.size = newSize;
		buffer.copy(this.buffer, oldSize);
		return this;
	}
	/**
	 * Gets the internal buffer to avoid calling {@link Buffer#slice}
	 * @private
	 * @readonly
	 * @type {external:Buffer}
	 */
	get rawBuffer() {
		return this.buffer;
	}
	/**
	 * Gets the occupied portion in {@link Buffer} form.
	 * @return {external:Buffer} The internal buffer trimmed to
	 * [this.length]{@link GrowableBuffer#length}
	 */
	toBuffer() {
		return this.buffer.slice(0, this.size);
	}
}
module.exports = GrowableBuffer;