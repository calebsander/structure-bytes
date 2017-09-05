import assert from '../lib/assert'
import GrowableBuffer from '../lib/growable-buffer'
import strToNum from '../lib/str-to-num'
import FloatingPointType from './floating'

/**
 * A type storing an 8-byte [IEEE floating point](https://en.wikipedia.org/wiki/IEEE_floating_point).
 * Can also represent `NaN`, `Infinity`, and `-Infinity`.
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.DoubleType
 * ````
 */
export default class DoubleType extends FloatingPointType {
	static get _value() {
		return 0x21
	}
	/**
	 * Appends value bytes to a [[GrowableBuffer]] according to the type
	 *
	 * Examples:
	 * ````javascript
	 * type.writeValue(buffer, 1.23) //or '1.23'
	 * ````
	 * or
	 * ````javascript
	 * type.writeValue(buffer, NaN) //or 'NaN'
	 * ````
	 * or
	 * ````javascript
	 * type.writeValue(buffer, Infinity) //or 'Infinity'
	 * ````
	 * @param buffer The buffer to which to append
	 * @param value The value to write
	 * @throws If the value doesn't match the type, e.g. `new sb.StringType().writeValue(buffer, 23)`
	 */
	writeValue(buffer: GrowableBuffer, value: number | string) {
		assert.instanceOf(buffer, GrowableBuffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.instanceOf(value, Number)
		const byteBuffer = new ArrayBuffer(8)
		new DataView(byteBuffer).setFloat64(0, value as number)
		buffer.addAll(byteBuffer)
	}
}