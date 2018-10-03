import AppendableBuffer from '../lib/appendable';
import { ReadResult } from '../lib/read-util';
import IntegerType from './integer';
/**
 * A type storing an arbitrary precision signed integer.
 * Each written value has its own number of bytes of precision.
 * Values must be provided as base-10 strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.BigIntType
 * ````
 */
export declare class BigIntType extends IntegerType<string, string> {
    static readonly _value: number;
    /**
     * Appends value bytes to an [[AppendableBuffer]] according to the type
     *
     * Examples:
     * ````javascript
     * type.writeValue(buffer, '-1') //takes up 2 bytes
     * ````
     * or
     * ````javascript
     * type.writeValue(buffer, '12345678901234567890') //takes up 10 bytes
     * ````
     * @param buffer The buffer to which to append
     * @param value The value to write
     * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
     */
    writeValue(buffer: AppendableBuffer, value: string): void;
    consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<string>;
}
