import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import writeLong from '../lib/write-long'
import ChronoType from './chrono'

/**
 * A type storing a [Date]{@link external:Date} with millisecond precision.
 * The value is stored as an 8-byte signed integer.
 * @extends Type
 * @inheritdoc
 */
export default class DateType extends ChronoType {
	static get _value() {
		return 0x1A
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {external:Date} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer: GrowableBuffer, value: Date) {
		assert.instanceOf(value, Date)
		writeLong(buffer, String(value.getTime()))
	}
}