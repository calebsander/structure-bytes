import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {NOT_LONG_ENOUGH, ReadResult} from '../lib/read-util'
import UnsignedType from './unsigned'

/**
 * A type storing an 8-byte unsigned integer
 * (`0` to `18446744073709551615`).
 * Each value must be provided as a BigInt.
 *
 * Example:
 * ````javascript
 * let type = new sb.UnsignedLongType
 * ````
 */
export class UnsignedLongType extends UnsignedType<bigint> {
	static get _value() {
		return 0x14
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, 12345678901234567890n)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: bigint) {
		this.isBuffer(buffer)
		assert.instanceOf(value, BigInt)
		if (value !== BigInt.asUintN(64, value)) throw new RangeError('Value out of range')
		const byteBuffer = new ArrayBuffer(8)
		new DataView(byteBuffer).setBigInt64(0, value)
		buffer.addAll(byteBuffer)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<bigint> {
		const length = 8
		if (buffer.byteLength < offset + length) throw new Error(NOT_LONG_ENOUGH)
		return {value: new DataView(buffer, offset).getBigUint64(0), length}
	}
}