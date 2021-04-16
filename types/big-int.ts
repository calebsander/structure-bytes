import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {timesEight} from '../lib/bit-math'
import * as flexInt from '../lib/flex-int'
import {NOT_LONG_ENOUGH, readFlexInt, ReadResult} from '../lib/read-util'
import IntegerType from './integer'

/**
 * A type storing an arbitrary precision signed integer.
 * Each written value has its own number of bytes of precision.
 *
 * Example:
 * ````javascript
 * let type = new sb.BigIntType
 * ````
 */
export class BigIntType extends IntegerType<bigint> {
	static get _value(): number {
		return 0x05
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Examples:
	 * ````javascript
	 * type.writeValue(buffer, -1n) //takes up 2 bytes
	 * ````
	 * or
	 * ````javascript
	 * type.writeValue(buffer, 12345678901234567890n) //takes up 10 bytes
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: bigint): void {
		assert.isBuffer(buffer)
		assert.instanceOf(value, BigInt)
		const bytes: number[] = []
		let signBit = 0n
		//Build bytes in LE order. Continue until sign-extended bytes match the value.
		//If a positive number has a 1 in the highest bit, another 0 byte is needed.
		//If a negative number has a 0 in the highest bit, another -1 byte is needed.
		while (value !== signBit) {
			const byte = BigInt.asIntN(8, value)
			bytes.push(Number(byte) & 0xFF)
			signBit = byte >> 8n
			value >>= 8n
		}
		const byteLength = bytes.length
		buffer.addAll(flexInt.makeValueBuffer(byteLength))
		for (let i = byteLength - 1; i >= 0; i--) { //write in reverse order to get BE
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
		//Sign-extend the read bytes
		value = BigInt.asIntN(timesEight(byteLength), value)
		length += byteLength
		return {value, length}
	}
}