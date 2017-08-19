import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import writeBooleans from '../lib/write-booleans'
import AbsoluteType from './absolute'

/**
 * A type storing a fixed-length array of {@link Boolean} values.
 * This type creates more efficient serializations than
 * {@link TupleType} for boolean arrays.
 * The length must be at most 255.
 * @see BooleanType
 * @see TupleType
 * @extends Type
 * @inheritdoc
 */
export default class BooleanTupleType extends AbsoluteType<boolean[]> {
	static get _value() {
		return 0x31
	}
	readonly length: number
	/**
	 * @param {number} length The number of {@link Boolean}s in each value of this type.
	 * Must fit in a 1-byte unsigned integer.
	 */
	constructor(length: number) {
		super()
		assert.byteUnsignedInteger(length)
		this.length = length
	}
	addToBuffer(buffer: GrowableBuffer) {
		/*istanbul ignore else*/
		if (super.addToBuffer(buffer)) {
			buffer.add(this.length)
			return true
		}
		/*istanbul ignore next*/
		return false
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {Boolean[]} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer: GrowableBuffer, value: boolean[]) {
		assert.instanceOf(buffer, GrowableBuffer)
		assert.instanceOf(value, Array)
		assert(
			value.length === this.length,
			'Length does not match: expected ' + String(this.length) + ' but got ' + String(value.length)
		)
		writeBooleans(buffer, value)
	}
	equals(otherType: any) {
		return super.equals(otherType) && otherType.length === this.length
	}
}