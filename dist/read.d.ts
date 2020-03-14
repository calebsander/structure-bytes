import { ReadResult } from './lib/read-util';
import * as t from './types';
declare function consumeType(typeBuffer: ArrayBuffer, offset: number): ReadResult<t.Type<unknown>>;
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
export declare function type(typeBuffer: ArrayBuffer | Uint8Array, fullBuffer?: boolean): t.Type<unknown>;
