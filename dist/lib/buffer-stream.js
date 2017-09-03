"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("./assert");
const growable_buffer_1 = require("./growable-buffer");
const stream_1 = require("stream");
/**
 * A class for creating a readable stream
 * out of an `ArrayBuffer`
 * or a [[GrowableBuffer]].
 * When dealing with very large buffers,
 * this allows chunks to be sent as they are requested
 * rather than stuffing the whole buffer into the stream at once.
 * The stream is intended mainly to be piped
 * into write streams.
 */
class BufferStream extends stream_1.Readable {
    /**
     * @param buffer
     * The buffer whose data to use.
     * If a [[GrowableBuffer]] is used, only the
     * occupied portion will be written by the stream.
     * Future additions to the [[GrowableBuffer]]
     * will not be written.
     * If bytes inside the `ArrayBuffer`
     * or occupied portion are changed, behavior is undefined.
     */
    constructor(buffer) {
        super();
        if (buffer && buffer.constructor === ArrayBuffer) {
            this.buffer = buffer;
            this.end = buffer.byteLength;
        }
        else if (buffer && buffer.constructor === growable_buffer_1.default) {
            this.buffer = buffer.rawBuffer;
            this.end = buffer.length; //end earlier than the end of the raw buffer
        }
        else {
            assert_1.default.fail('Expected ArrayBuffer or GrowableBuffer, got ' +
                (buffer ? buffer.constructor.name : String(buffer)) //buffer should always have a constructor if it is neither undefined nor null
            );
        }
        this.offset = 0;
    }
    _read(size) {
        if (this.offset < this.end) {
            this.push(Buffer.from(this.buffer.slice(this.offset, Math.min(this.offset + size, this.end))));
            this.offset += size;
        }
        else {
            this.push(null);
            this.emit('bs-written');
        }
    }
}
exports.default = BufferStream;
