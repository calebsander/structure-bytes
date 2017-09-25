"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const stream_1 = require("stream");
const assert_1 = require("./assert");
const growable_buffer_1 = require("./growable-buffer");
const WRITABLE_STREAMS = [stream_1.Writable, stream_1.Duplex, http_1.OutgoingMessage];
/**
 * A wrapper around a writable stream
 * to implement [[AppendableBuffer]].
 * The stream must be explicitly closed
 * by calling [[end]] after all bytes
 * have been written.
 */
class AppendableStream {
    /**
     * @param outStream The underlying writable stream
     */
    constructor(outStream) {
        assert_1.default.instanceOf(outStream, WRITABLE_STREAMS);
        this.outStream = outStream;
        this.writtenBytes = 0;
        this.paused = null;
    }
    /**
     * Appends a byte to the end
     * of the written data
     * @param value The unsigned byte value to add
     */
    add(value) {
        assert_1.default.integer(value);
        assert_1.default.between(0, value, 0x100, 'Not a byte: ' + String(value));
        return this.addAll(new Uint8Array([value]).buffer);
    }
    /**
     * Appends a contiguous set of bytes
     * to the end of the written data
     * @param buffer The bytes to add
     */
    addAll(buffer) {
        assert_1.default.instanceOf(buffer, ArrayBuffer);
        if (this.paused)
            this.paused.addAll(buffer);
        else
            this.outStream.write(Buffer.from(buffer));
        this.writtenBytes += buffer.byteLength;
        return this;
    }
    /**
     * Closes the underlying stream
     */
    end() {
        this.outStream.end();
    }
    /**
     * The number of bytes that have been written
     */
    get length() {
        return this.writtenBytes;
    }
    /**
     * Pauses the writing process, i.e.
     * bytes added are not written
     * to the underlying output until
     * [[resume]] is next called and
     * can be cancelled from being written
     * by calling [[reset]].
     * @throws If paused earlier and never resumed
     */
    pause() {
        assert_1.default(this.paused === null, 'Already paused');
        this.paused = new growable_buffer_1.default;
        return this;
    }
    /**
     * See [[pause]].
     * Flushes all paused data to the output
     * and exits paused mode.
     * @throws If not currently paused
     */
    resume() {
        if (!this.paused)
            throw new Error('Was not paused');
        const { length } = this.paused;
        this.outStream.write(Buffer.from(this.paused.rawBuffer, 0, length));
        this.paused = null;
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
        if (!this.paused)
            throw new Error('Was not paused');
        this.writtenBytes -= this.paused.length;
        this.paused = new growable_buffer_1.default;
        return this;
    }
}
exports.default = AppendableStream;
