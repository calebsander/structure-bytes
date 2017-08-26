import * as t from './types';
export interface ReadResult<E> {
    value: E;
    length: number;
}
declare function consumeType(typeBuffer: ArrayBuffer, offset: number): ReadResult<t.Type<any>>;
export { consumeType as _consumeType };
/**
 * Deserializes a type, i.e. takes a buffer
 * containing its binary form and creates the type object.
 * The inverse of calling [[Type.toBuffer]].
 *
 * Example:
 * ````javascript
 * let type = new sb.ArrayType(
 *   new sb.FlexUnsignedIntType
 * )
 * let typeBuffer = type.toBuffer()
 * let readType = sb.r.type(typeBuffer)
 * console.log(readType) // ArrayType { type: FlexUnsignedIntType {} }
 * ````
 *
 * @param typeBuffer The buffer containing the type bytes
 * @param fullBuffer Whether to assert that the whole buffer was read.
 * In most use cases, this argument should be be omitted.
 * @return The type that was read
 */
export declare function type(typeBuffer: ArrayBuffer, fullBuffer?: boolean): t.Type<any>;
/**
 * @param E The type of value to be read
 */
export interface ValueParams<E> {
    /**
     * The buffer containing the value bytes
     */
    buffer: ArrayBuffer;
    /**
     * The type (or an equivalent one) that wrote the value bytes
     */
    type: t.Type<E>;
    /**
     * The index in the buffer to start reading from;
     * defaults to `0`
     */
    offset?: number;
}
/**
 * Deserializes a value, i.e. takes
 * the type that serialized it and a buffer
 * containing its binary form and returns the value.
 * Requires the type to be known.
 *
 * Example:
 * ````javascript
 * let type = new sb.ArrayType(
 *   new sb.FlexUnsignedIntType
 * )
 * let value = [0, 10, 100, 1000, 10000]
 * let buffer = type.valueBuffer(value)
 * let readValue = sb.r.value({type, buffer})
 * console.log(readValue) // [ 0, 10, 100, 1000, 10000 ]
 * ````
 *
 * @param E The type of value to be read
 * @return The value that was read
 */
export declare function value<E>(params: ValueParams<E>): E;
