import * as assert from '../lib/assert'
import type {AppendableBuffer} from '../lib/appendable'
import {readLong, ReadResult} from '../lib/read-util'
import {writeLong} from '../lib/write-util'
import IntegerType from './integer'

/**
 * A type storing an 8-byte signed integer
 * (`-9223372036854775808` to `9223372036854775807`).
 * Each value must be provided as a BigInt.
 *
 * Example:
 * ````javascript
 * let type = new sb.LongType
 * ````
 */
export class LongType extends IntegerType<bigint> {
	static get _value(): number {
		return 0x04
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, -1234567890123456789n)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: bigint): void {
		assert.isBuffer(buffer)
		writeLong(buffer, value)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<bigint> {
		return readLong(buffer, offset)
	}
}