import type {AppendableBuffer} from '../lib/appendable'
import * as assert from '../lib/assert'
import {BufferOffset, readNumber} from '../lib/read-util'
import strToNum from '../lib/str-to-num'
import FloatingPointType from './floating'

const readFloat = readNumber({type: Float32Array, func: 'getFloat32'})

/**
 * A type storing a 4-byte [IEEE floating point](https://en.wikipedia.org/wiki/IEEE_floating_point).
 * Can also represent `NaN`, `Infinity`, and `-Infinity`.
 * Can specify values to write as numbers or strings.
 *
 * Example:
 * ````javascript
 * let type = new sb.FloatType
 * ````
 */
export class FloatType extends FloatingPointType {
	static get _value(): number {
		return 0x20
	}
	/**
	 * Appends value bytes to an [[AppendableBuffer]] according to the type
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
	writeValue(buffer: AppendableBuffer, value: number | string): void {
		assert.isBuffer(buffer)
		const convertedValue = strToNum(value)
		if (convertedValue !== undefined) value = convertedValue
		assert.instanceOf(value, Number)
		const byteBuffer = new ArrayBuffer(4)
		new DataView(byteBuffer).setFloat32(0, value as number)
		buffer.addAll(byteBuffer)
	}
	consumeValue(bufferOffset: BufferOffset): number {
		return readFloat(bufferOffset)
	}
}