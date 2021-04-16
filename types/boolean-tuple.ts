import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import * as flexInt from '../lib/flex-int'
import {readBooleans, ReadResult} from '../lib/read-util'
import {writeBooleans} from '../lib/write-util'
import AbsoluteType from './absolute'

/**
 * A type storing a fixed-length array of `Boolean` values.
 * This type creates more efficient serializations than
 * `new sb.TupleType({type: new sb.BooleanType})` for boolean tuples,
 * since it works with bits instead of whole bytes.
 *
 * Example:
 * ````javascript
 * let type = new sb.BooleanTupleType(100)
 * ````
 */
export class BooleanTupleType extends AbsoluteType<boolean[]> {
	static get _value(): number {
		return 0x31
	}
	/**
	 * @param length The number of `Boolean`s in each value of this type
	 */
	constructor(readonly length: number) {
		super()
		assert.nonNegativeInteger(length)
	}
	addToBuffer(buffer: AppendableBuffer): boolean {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			buffer.addAll(flexInt.makeValueBuffer(this.length))
			return true
		}
		/*istanbul ignore next*/
		return false
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
	 *
	 * Example:
	 * ````javascript
	 * type.writeValue(buffer, new Array(100).fill(true)) //takes up 13 bytes
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: AppendableBuffer, value: boolean[]): void {
		assert.isBuffer(buffer)
		assert.instanceOf(value, Array)
		if (value.length !== this.length) throw new Error(`Length does not match: expected ${this.length} but got ${value.length}`)
		writeBooleans(buffer, value)
	}
	consumeValue(buffer: ArrayBuffer, offset: number): ReadResult<boolean[]> {
		return readBooleans({buffer, offset, count: this.length})
	}
	equals(otherType: unknown): boolean {
		return this.isSameType(otherType) && otherType.length === this.length
	}
}