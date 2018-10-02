"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appendable_1 = require("./appendable");
const assert_1 = require("./assert");
const INITIAL_LENGTH = 10;
/**
 * A [`StringBuilder`](https://docs.oracle.com/javase/8/docs/api/java/lang/StringBuilder.html)-like
 * object which automatically grows its internal buffer as bytes are added.
 * Uses an `ArrayBuffer` to store the binary data.
 * Used extensively throughout the project for building up buffers.
 * See [[GrowableBuffer.grow]] for an explanation of the growing process.
 */
class GrowableBuffer extends appendable_1.default {
    /**
     * @param initialLength
     * The number of bytes in the internal buffer at start
     * (defaults to 10)
     */
    constructor(initialLength = INITIAL_LENGTH) {
        super();
        try {
            assert_1.default.integer(initialLength);
            assert_1.default(initialLength >= 0);
        }
        catch (e) {
            throw new RangeError(`${initialLength} is not a valid buffer length`);
        }
        this.buffer = new ArrayBuffer(initialLength);
        this.size = 0;
        this.pausePoints = [];
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
        if (size > this.buffer.byteLength) { //if resizing is necessary
            const newBuffer = new ArrayBuffer(size << 1);
            new Uint8Array(newBuffer).set(new Uint8Array(this.buffer).subarray(0, this.size));
            this.buffer = newBuffer;
        }
        return this;
    }
    /**
     * Adds a byte after the end of the
     * occupied portion of the internal buffer
     * @param value The unsigned byte value to add
     */
    add(value) {
        assert_1.default.integer(value);
        assert_1.default.between(0, value, 0x100, `Not a byte: ${value}`);
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
        let length;
        if (this.pausePoints.length)
            [length] = this.pausePoints; //go up to first pause point
        else
            length = this.size;
        return length === this.buffer.byteLength
            ? this.buffer
            : this.buffer.slice(0, length);
    }
    /**
     * Pauses the writing process, i.e.
     * bytes added are not written
     * to the underlying output until
     * [[resume]] is next called and
     * can be cancelled from being written
     * by calling [[reset]].
     *
     * If called multiple times, [[resume]]
     * and [[reset]] only act on bytes added
     * since the most recent pause. Example:
     * ````javascript
     * let gb = new GrowableBuffer
     * gb
     *   .pause()
     *     .add(1).add(2).add(3)
     *     .pause()
     *       .add(4).add(5).add(6)
     *       .reset() //cancels [4, 5, 6]
     *     .resume()
     *   .resume() //resumes [1, 2, 3]
     * console.log(new Uint8Array(gb.toBuffer())) //Uint8Array [ 1, 2, 3 ]
     * ````
     */
    pause() {
        this.pausePoints.push(this.size);
        return this;
    }
    /**
     * See [[pause]].
     * Flushes all paused data to the output
     * and exits paused mode.
     * @throws If not currently paused
     */
    resume() {
        if (!this.pausePoints.length)
            throw new Error('Was not paused');
        this.pausePoints.pop();
        return this;
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
        if (!this.pausePoints.length)
            throw new Error('Was not paused');
        const pausePoint = this.pausePoints[this.pausePoints.length - 1];
        this.size = pausePoint;
        return this;
    }
}
exports.default = GrowableBuffer;
