import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {NOT_LONG_ENOUGH, readFlexInt, ReadResult} from '../lib/read-util'
import AbsoluteType from './absolute'

/**
 * A type storing a variable-length array of bytes.
 * This is intended for data that
 * doesn't fit any other category,
 * e.g. the contents of a PNG file.
 *
 * Example:
 * ````javascript
 * let type = new sb.OctetsType
 * ````
 */
export class OctetsType extends AbsoluteType<ArrayBuffer | Uint8Array, ArrayBuffer> {
	static get _value() {
		return 0x42
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * let octets = new Uint8Array([1, 2, 3, 4, 5])
	 * type.writeValue(buffer, octets)
	 * // or
	 * type.writeValue(buffer, octets.buffer)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: ArrayBuffer | Uint8Array) {
		this.isBuffer(buffer)
		assert.instanceOf(value, [ArrayBuffer, Uint8Array])
		buffer
			.addAll(flexInt.makeValueBuffer(value.byteLength))
			.addAll(value)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<ArrayBuffer> {
		//tslint:disable-next-line:prefer-const
		let {value: octetsLength, length} = readFlexInt(buffer, offset)
		const octetsStart = length
		length += octetsLength
		if (buffer.byteLength < offset + length) throw new Error(NOT_LONG_ENOUGH)
		return {
			value: buffer.slice(offset + octetsStart, offset + length),
			length
		}
	}
}