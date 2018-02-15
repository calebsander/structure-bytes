import AppendableBuffer from './appendable';
import Type from '../types/type';
export interface IterableWriteParams<E> {
    type: Type<E>;
    buffer: AppendableBuffer;
    value: Iterable<E>;
    length: number;
}
declare const _default: <E>({ type, buffer, value, length }: IterableWriteParams<E>) => void;
export default _default;
