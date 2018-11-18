import AppendableBuffer from '../lib/appendable'
import * as assert from './assert'
import * as strint from './strint'

const LONG_MAX = '9223372036854775807',
	LONG_MIN = '-9223372036854775808'
/**
 * Writes the given string value as a signed long (8 bytes)
 * @param buffer The buffer to which to append
 * @param value The value to write (a numeric string)
 */
export default (buffer: AppendableBuffer, value: string): void => {
	assert.instanceOf(value, String)
	if (strint.gt(value, LONG_MAX) || strint.lt(value, LONG_MIN)) throw new RangeError('Value out of range')
	const upper = strint.div(value, strint.LONG_UPPER_SHIFT, true) //get upper signed int
	const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT)) //get lower unsigned int
	const byteBuffer = new ArrayBuffer(8)
	const dataView = new DataView(byteBuffer)
	dataView.setInt32(0, Number(upper))
	dataView.setUint32(4, Number(lower))
	buffer.addAll(byteBuffer)
}