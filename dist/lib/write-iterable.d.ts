import AppendableBuffer from './appendable';
import { Type } from '../types';
export interface IterableWriteParams<E> {
    type: Type<E>;
    buffer: AppendableBuffer;
    value: Iterable<E>;
    length: number;
}
declare const _default: <E>({ type, buffer, value, length }: IterableWriteParams<E>) => void;
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
export default _default;
