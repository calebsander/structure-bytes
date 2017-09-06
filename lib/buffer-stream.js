"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * An ugly way of creating a readable stream
 * with the given contents.
 * Used for testing purposes only.
 */
class BufferStream extends stream_1.Readable {
    constructor(buffer) {
        super();
        this._read = () => { };
        this.push(Buffer.from(buffer));
        this.push(null);
    }
}
exports.default = BufferStream;
