import GrowableBuffer from './growable-buffer';
import Type from '../types/type';
export interface IterableWriteParams<E> {
    type: Type<E>;
    buffer: GrowableBuffer;
    value: Iterable<E>;
    length: number;
    root: boolean;
}
declare const _default: <E>({type, buffer, value, length, root}: IterableWriteParams<E>) => void;
export default _default;
