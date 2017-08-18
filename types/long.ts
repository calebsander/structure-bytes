import GrowableBuffer from '../lib/growable-buffer'
import writeLong from '../lib/write-long'
import IntegerType from './integer'

/**
 * A type storing an 8-byte signed integer
 * @extends Type
 * @inheritdoc
 */
export default class LongType extends IntegerType<string> {
	static get _value() {
		return 0x04
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {string} value The value to write (a base-10 string representation of an integer)
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer: GrowableBuffer, value: string) {
		writeLong(buffer, value)
	}
}