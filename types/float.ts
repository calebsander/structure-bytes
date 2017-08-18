import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import strToNum from '../lib/str-to-num'
import FloatingPointType from './floating'

/**
 * A type storing a 4-byte [IEEE floating point]{@linkplain https://en.wikipedia.org/wiki/IEEE_floating_point}
 * @extends Type
 * @inheritdoc
 */
export default class FloatType extends FloatingPointType {
	static get _value() {
		return 0x20
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
		assert.instanceOf(value, Number)
		const byteBuffer = new ArrayBuffer(4)
		new DataView(byteBuffer).setFloat32(0, value as number)
		buffer.addAll(byteBuffer)
	}
}