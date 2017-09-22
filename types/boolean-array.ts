import AppendableBuffer from '../lib/appendable'
import assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {readBooleans, readFlexInt, ReadResult} from '../lib/read-util'
import writeBooleans from '../lib/write-booleans'
import AbsoluteType from './absolute'

/**
 * A type storing a variable-length array of `Boolean` values.
 * This type creates more efficient serializations than
 * `new sb.ArrayType(new sb.BooleanType)` for boolean arrays,
 * since it works with bits instead of whole bytes.
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanArrayType
 * ````
 */
export default class BooleanArrayType extends AbsoluteType<boolean[]> {
	static get _value() {
		return 0x32
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Examples:
	 * ````javascript
	 * type.writeValue(buffer, [false]) //takes up 2 bytes
	 * ````
	 * or
	 * ````javascript
	 * type.writeValue(buffer, new Array(100).fill(true)) //takes up 14 bytes
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: boolean[]) {
		this.isBuffer(buffer)
		assert.instanceOf(value, Array)
		buffer.addAll(flexInt.makeValueBuffer(value.length))
		writeBooleans(buffer, value)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<boolean[]> {
		const arrayLength = readFlexInt(buffer, offset)
		let {length} = arrayLength
		const booleans = readBooleans({buffer, offset: offset + length, count: arrayLength.value})
		const {value} = booleans
		length += booleans.length
		return {value, length}
	}
}