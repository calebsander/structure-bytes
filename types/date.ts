import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {readLong, ReadResult} from '../lib/read-util'
import {writeLong} from '../lib/write-util'
import ChronoType from './chrono'

/**
 * A type storing a `Date` with millisecond precision.
 * The value is stored as an 8-byte signed integer.
 *
 * Example:
 * ````javascript
 * let type = new sb.DateType
 * ````
 */
export class DateType extends ChronoType {
	static get _value() {
		return 0x1A
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, new Date)
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: Date) {
		this.isBuffer(buffer)
		assert.instanceOf(value, Date)
		writeLong(buffer, BigInt(value.getTime()))
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<Date> {
		const {value, length} = readLong(buffer, offset)
		return {value: new Date(Number(value)), length}
	}
}