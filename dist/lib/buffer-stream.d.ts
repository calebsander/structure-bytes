/// <reference types="node" />
import GrowableBuffer from './growable-buffer';
import { Readable } from 'stream';
/**
 * A class for creating a readable stream
 * out of an [ArrayBuffer]{@link external:ArrayBuffer}
 * or a {@link GrowableBuffer}.
 * When dealing with very large buffers,
 * this allows chunks to be sent as they are requested
 * rather than stuffing the whole buffer into the stream at once.
 * The stream is intended mainly to be piped
 * into write streams.
 */
export default class BufferStream extends Readable {
    private readonly buffer;
    private readonly end;
    private offset;
    /**
     * @param {external:ArrayBuffer|GrowableBuffer} buffer
     * The buffer whose data to use.
     * If a {@link GrowableBuffer} is used, only the
     * occupied portion will be written by the stream.
     * Future additions to the {@link GrowableBuffer}
     * will not be written.
     * If bytes inside the [ArrayBuffer]{@link external:ArrayBuffer}
     * or occupied portion are changed, behavior is undefined.
     */
    constructor(buffer: ArrayBuffer | GrowableBuffer);
    _read(size: number): void;
}
