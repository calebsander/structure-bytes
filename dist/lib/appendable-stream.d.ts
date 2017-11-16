/// <reference types="node" />
import { Writable } from 'stream';
import AppendableBuffer from './appendable';
/**
 * A wrapper around a writable stream
 * to implement [[AppendableBuffer]].
 * The stream must be explicitly closed
 * by calling [[end]] after all bytes
 * have been written.
 */
export default class AppendableStream extends AppendableBuffer {
    private readonly outStream;
    private writtenBytes;
    private pauseCount;
    private paused;
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
    pause(): this;
    /**
     * See [[pause]].
     * Flushes all paused data to the output
     * and exits paused mode.
     * @throws If not currently paused
     */
    resume(): this;
    /**
     * See [[pause]].
     * Restores state to immediately after
     * this [[AppendableBuffer]] was paused.
     * Prevents paused data from ever
     * being flushed to the output.
     * @throws If not currently paused
     */
    reset(): this;
}
