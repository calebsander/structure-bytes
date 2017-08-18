import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import strToNum from '../lib/str-to-num'
import IntegerType from './integer'

/**
 * A type storing a 2-byte signed integer
 * @extends Type
 * @inheritdoc
 */
export default class ShortType extends IntegerType<number | string> {
	static get _value() {
		return 0x02
	}
	/**
	 * Appends value bytes to a {@link GrowableBuffer} according to the type
	 * @param {GrowableBuffer} buffer The buffer to which to append
	 * @param {number|string} value The value to write
	 * @throws {Error} If the value doesn't match the type, e.g. {@link new sb.StringType().writeValue(buffer, 23)}
	 */
	writeValue(buffer: GrowableBuffer, value: number | string) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.integer(value)
		assert.between(-32768, value as number, 32768, 'Value out of range')
		const byteBuffer = new ArrayBuffer(2)
		new DataView(byteBuffer).setInt16(0, value as number)
		buffer.addAll(byteBuffer)
	}
}