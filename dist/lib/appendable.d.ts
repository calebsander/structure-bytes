/**
 * A "writable" interface, sufficient
 * to be able to write type and value bytes.
 * Implemented by [[GrowableBuffer]], as well as
 * [[AppendableStream]] (a wrapper around a writable stream).
 */
export default interface AppendableBuffer {
    /**
     * The number of bytes that have been written
     */
    readonly length: number;
    /**
     * Adds a byte after the end
     * of the written data
     * @param value The unsigned byte value to add
     */
    add(value: number): this;
    /**
     * Adds a contiguous set of bytes
     * after the end of the written data
     * @param buffer The bytes to add.
     * The byte at position `i` in `buffer` will be written to
     * position `this.length + i`.
     */
    addAll(buffer: ArrayBuffer): this;
}
