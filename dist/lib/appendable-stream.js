"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const stream_1 = require("stream");
const assert_1 = require("./assert");
const WRITABLE_STREAMS = [stream_1.Writable, stream_1.Duplex, http_1.OutgoingMessage];
/**
 * A wrapper around a writable stream
 * to implement [[AppendableBuffer]].
 * The stream must be explicitly closed
 * by calling [[AppendableStream.end]]
 * after all bytes have been written.
 */
class AppendableStream {
    /**
     * @param outStream The underlying writable stream
     */
    constructor(outStream) {
        assert_1.default.instanceOf(outStream, WRITABLE_STREAMS);
        this.outStream = outStream;
        this.writtenBytes = 0;
    }
    /**
     * Appends a byte to the end
     * of the written data
     * @param value The unsigned byte value to add
     */
    add(value) {
        assert_1.default.integer(value);
        assert_1.default.between(0, value, 0x100, 'Not a byte: ' + String(value));
        this.outStream.write(Buffer.from([value]));
        this.writtenBytes++;
        return this;
    }
    /**
     * Appends a contiguous set of bytes
     * to the end of the written data
     * @param buffer The bytes to add
     */
    addAll(buffer) {
        assert_1.default.instanceOf(buffer, ArrayBuffer);
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
}
exports.default = AppendableStream;
