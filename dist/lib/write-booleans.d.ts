import AppendableBuffer from './appendable';
declare const _default: (buffer: AppendableBuffer, booleans: boolean[]) => void;
/**
 * Writes an array of booleans for [[BooleanTupleType]]
 * or [[BooleanArrayType]].
 * The boolean at index `8 * a + b` (where `a` is an integer
 * and `b` is an integer from `0` to `7`) is in the `b`th MSB
 * (0-indexed) of the `a`th appended byte.
 * @param buffer The buffer to which to append the bytes
 * @param booleans The boolean values to write
 */
export default _default;
