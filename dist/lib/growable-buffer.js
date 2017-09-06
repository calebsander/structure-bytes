"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
const INITIAL_LENGTH = 10;
/**
 * A [`StringBuilder`](https://docs.oracle.com/javase/8/docs/api/java/lang/StringBuilder.html)-like
 * object which automatically grows its internal buffer as bytes are added.
 * Uses an `ArrayBuffer` to store the binary data.
 * Used extensively throughout the project for building up buffers.
 * See [[GrowableBuffer.grow]] for an explanation of the growing process.
 */
class GrowableBuffer {
    /**
     * @param initialLength
     * The number of bytes in the internal buffer at start
     * (defaults to 10)
     */
    constructor(initialLength = INITIAL_LENGTH) {
        try {
            assert_1.default.integer(initialLength);
            assert_1.default.between(0, initialLength, Number.MAX_SAFE_INTEGER + 1);
        }
        catch (e) {
            throw new RangeError(String(initialLength) + ' is not a valid buffer length');
        }
        this.buffer = new ArrayBuffer(initialLength);
        this.size = 0;
    }
    /**
     * The current number of bytes being occupied.
     * Note that this is NOT the size of the internal buffer.
     */
    get length() {
        return this.size;
    }
    /**
     * Grow the internal buffer to hold
     * at least the specified number of bytes.
     * If the internal buffer is too small,
     * it will be resized to `size * 2`.
     * If the buffer is already sufficiently long, nothing happens.
     * This is called internally when needed,
     * but if a program knows it will need a lot of space eventually,
     * this method can be called explicitly to avoid unnecessary copying.
     * @param size An inclusive lower bound on the number of bytes
     * in the internal buffer after the method returns
     */
    grow(size) {
        assert_1.default.integer(size);
        if (size > this.buffer.byteLength) {
            const newBuffer = new ArrayBuffer(size << 1);
            new Uint8Array(newBuffer).set(new Uint8Array(this.buffer).subarray(0, this.size));
            this.buffer = newBuffer;
        }
        return this;
    }
    /**
     * Sets a byte's value.
     * The byte must lie in the occupied portion
     * of the internal buffer.
     * @param index The position of the byte (0-indexed)
     * @param value The value to set the byte to
     * (must fit in an unsigned byte)
     */
    set(index, value) {
        assert_1.default.integer(value);
        assert_1.default.between(0, value, 0x100, 'Not a byte: ' + String(value));
        return this.setAll(index, new Uint8Array([value]).buffer);
    }
    /**
     * Sets a set of contiguous bytes' values.
     * Each byte must lie in the occupied portion
     * of the internal buffer.
     * @param index The position of the first byte (0-indexed)
     * @param buffer The values to write, starting at `index`
     * (the byte at position `i` in `buffer` will be written to
     * position `index + i` of the [[GrowableBuffer]])
     */
    setAll(index, buffer) {
        assert_1.default.instanceOf(buffer, ArrayBuffer);
        assert_1.default.integer(index);
        assert_1.default.between(0, index, this.size - buffer.byteLength + 1, 'Index out of bounds: ' + String(index));
        new Uint8Array(this.buffer).set(new Uint8Array(buffer), index);
        return this;
    }
    /**
     * Gets a byte's value.
     * The byte must lie in the occupied portion
     * of the internal buffer.
     * @param index The position of the byte (0-indexed)
     * @return The unsigned byte at the specified index
     * of the internal buffer
     */
    get(index) {
        assert_1.default.integer(index);
        assert_1.default.between(0, index, this.size, 'Index out of bounds: ' + String(index));
        return new Uint8Array(this.buffer)[index];
    }
    /**
     * Adds a byte after the end of the
     * occupied portion of the internal buffer
     * @param value The unsigned byte value to add
     */
    add(value) {
        assert_1.default.integer(value);
        assert_1.default.between(0, value, 0x100, 'Not a byte: ' + String(value));
        return this.addAll(new Uint8Array([value]).buffer);
    }
    /**
     * Adds a contiguous set of bytes after
     * the end of the occupied portion
     * of the internal buffer
     * @param buffer The bytes to add.
     * The byte at position `i` in `buffer` will be written to
     * position `this.length + i` of the [[GrowableBuffer]]).
     */
    addAll(buffer) {
        assert_1.default.instanceOf(buffer, ArrayBuffer);
        const oldSize = this.size;
        const newSize = this.size + buffer.byteLength;
        this.grow(newSize);
        this.size = newSize;
        new Uint8Array(this.buffer).set(new Uint8Array(buffer), oldSize);
        return this;
    }
    /**
     * Gets the internal buffer to avoid calling `ArrayBuffer.slice()`
     * @private
     */
    get rawBuffer() {
        return this.buffer;
    }
    /**
     * Gets the occupied portion in `ArrayBuffer` form
     * @return The internal buffer trimmed to `this.length`
     */
    toBuffer() {
        return this.buffer.slice(0, this.size);
    }
}
exports.default = GrowableBuffer;
