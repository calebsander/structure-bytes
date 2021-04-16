import type { AppendableBuffer } from '../lib/appendable';
import { BufferOffset } from '../lib/read-util';
import AbsoluteType from './absolute';
/**
 * A type storing a fixed-length array of `Boolean` values.
 * This type creates more efficient serializations than
 * `new sb.TupleType({type: new sb.BooleanType})` for boolean tuples,
 * since it works with bits instead of whole bytes.
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanTupleType(100)
 * ````
 */
export declare class BooleanTupleType extends AbsoluteType<boolean[]> {
    readonly length: number;
    static get _value(): number;
    /**
     * @param length The number of `Boolean`s in each value of this type
     */
    constructor(length: number);
    addToBuffer(buffer: AppendableBuffer): boolean;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Example:
     * ````javascript
     * type.writeValue(buffer, new Array(100).fill(true)) //takes up 13 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: boolean[]): void;
    consumeValue(bufferOffset: BufferOffset): boolean[];
    equals(otherType: unknown): boolean;
}
