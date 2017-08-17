import * as t from './structure-types';
export interface ReadResult<E> {
    value: E;
    length: number;
}
declare function consumeType(typeBuffer: ArrayBuffer, offset: number): ReadResult<t.Type<any>>;
/** @function
 * @private
 */
export { consumeType as _consumeType };
/** @function
 * @desc Reads a type from its written buffer
 * @param {external:Buffer} typeBuffer
 * The buffer containing the type bytes
 * @param {boolean} [fullBuffer=true] Whether to assert that
 * the whole buffer was read. In most use cases, should be omitted.
 * @return {Type} The type that was read
 */
export declare function type(typeBuffer: ArrayBuffer, fullBuffer?: boolean): t.Type<any>;
export interface ValueParams<E> {
    buffer: ArrayBuffer;
    type: t.Type<E>;
    offset?: number;
}
/** @function
 * @desc Reads a value from its written buffer.
 * Requires the type to be known.
 * @param {{buffer, type, offset}} params
 * @param {external:Buffer} params.buffer
 * The buffer containing the value bytes
 * @param {Type} params.type
 * The type that was used to write the value bytes
 * @param {number} [params.offset=0]
 * The offset in the buffer to start reading at
 * @return The value that was read
 */
export declare function value<E>({buffer, type, offset}: ValueParams<E>): E;
