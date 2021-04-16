import { BufferOffset } from './lib/read-util';
import * as t from './types';
declare type Type = t.Type<unknown>;
declare type TypeReader = (bufferOffset: BufferOffset) => Type;
/**
 * Reads a type from a buffer and advances its offset
 * @param bufferOffset The buffer and its current offset
 * @return The deserialized type
 */
export declare const consumeType: TypeReader;
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
 * @param buffer The buffer containing the type bytes
 * @param fullBuffer Whether to assert that the whole buffer was read.
 * In most use cases, this argument should be be omitted.
 * @return The type that was read
 */
export declare function type(buffer: ArrayBuffer | Uint8Array, fullBuffer?: boolean): Type;
export {};
