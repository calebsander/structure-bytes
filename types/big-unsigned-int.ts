import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {NOT_LONG_ENOUGH, readFlexInt, ReadResult} from '../lib/read-util'
import UnsignedType from './unsigned'

/**
 * A type storing an arbitrary precision unsigned integer.
 * Each written value has its own number of bytes of precision.
 *
 * Example:
 * ````javascript
 * let type = new sb.BigUnsignedIntType
 * ````
 */
export class BigUnsignedIntType extends UnsignedType<bigint> {
	static get _value(): number {
		return 0x15
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Examples:
	 * ````javascript
	 * type.writeValue(buffer, 1n) //takes up 2 bytes
	 * ````
	 * or
	 * ````javascript
	 * type.writeValue(buffer, 12345678901234567890n) //takes up 9 bytes
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: bigint): void {
		this.isBuffer(buffer)
		assert.instanceOf(value, BigInt)
		if (value < 0n) throw new RangeError('Value out of range')
		const bytes: number[] = []
		while (value) {
			bytes.push(Number(BigInt.asUintN(8, value)))
			value >>= 8n
		}
		const byteLength = bytes.length
		buffer.addAll(flexInt.makeValueBuffer(byteLength))
		for (let i = bytes.length - 1; i >= 0; i--) { //write in reverse order to get BE
			buffer.add(bytes[i])
		}
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<bigint> {
		const readByteLength = readFlexInt(buffer, offset)
		const byteLength = readByteLength.value
		let {length} = readByteLength
		if (buffer.byteLength < offset + length + byteLength) throw new Error(NOT_LONG_ENOUGH)
		let value = 0n
		for (const byte of new Uint8Array(buffer, offset + length, byteLength)) {
			value = value << 8n | BigInt(byte)
		}
		length += byteLength
		return {value, length}
	}
}