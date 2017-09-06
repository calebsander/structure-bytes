/// <reference types="node" />
import { Writable } from 'stream';
import AppendableBuffer from './appendable';
/**
 * A wrapper around a writable stream
 * to implement [[AppendableBuffer]].
 * The stream must be explicitly closed
 * by calling [[AppendableStream.end]]
 * after all bytes have been written.
 */
export default class AppendableStream implements AppendableBuffer {
    private readonly outStream;
    private writtenBytes;
    /**
     * @param outStream The underlying writable stream
     */
    constructor(outStream: Writable);
    /**
     * Appends a byte to the end
     * of the written data
     * @param value The unsigned byte value to add
     */
    add(value: number): this;
    /**
     * Appends a contiguous set of bytes
     * to the end of the written data
     * @param buffer The bytes to add
     */
    addAll(buffer: ArrayBuffer): this;
    /**
     * Closes the underlying stream
     */
    end(): void;
    /**
     * The number of bytes that have been written
     */
    readonly length: number;
}
