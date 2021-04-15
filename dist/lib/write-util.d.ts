import type { AppendableBuffer } from './appendable';
import type { Type } from '../types';
/**
 * Writes a single boolean value to a buffer.
 * `true` is written as `0xFF`; `false` is written as `0x00`.
 * @param buffer The buffer to which to append the byte
 * @param value The boolean value to write
 */
export declare const writeBooleanByte: (buffer: AppendableBuffer, value: boolean) => AppendableBuffer;
/**
 * Writes an array of booleans for [[BooleanTupleType]]
 * or [[BooleanArrayType]].
 * The boolean at index `8 * a + b` (where `a` is an integer
 * and `b` is an integer from `0` to `7`) is in the `b`th MSB
 * (0-indexed) of the `a`th appended byte.
 * @param buffer The buffer to which to append the bytes
 * @param booleans The boolean values to write
 */
export declare function writeBooleans(buffer: AppendableBuffer, booleans: boolean[]): void;
export interface IterableWriteParams<E> {
    type: Type<E>;
    buffer: AppendableBuffer;
    value: Iterable<E>;
    length: number;
}
/**
 * Writes any iterable value to the buffer.
 * Used by [[ArrayType]] and [[SetType]].
 * Appends value bytes to an [[AppendableBuffer]] according to the type.
 * @param type The type to use to write individual elements
 * @param buffer The buffer to which to append
 * @param value The value to write
 * @param length The number of elements in `value`
 * @throws If the value doesn't match the type, e.g. `new sb.ArrayType().writeValue(buffer, 23)`
 */
export declare function writeIterable<E>({ type, buffer, value, length }: IterableWriteParams<E>): void;
/**
 * Writes the given string value as a signed long (8 bytes)
 * @param buffer The buffer to which to append
 * @param value The value to write (a numeric string)
 */
export declare function writeLong(buffer: AppendableBuffer, value: bigint): void;
