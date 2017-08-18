import assert from './assert'
import GrowableBuffer from './growable-buffer'
import * as strint from './strint'

const LONG_MAX = '9223372036854775807',
	LONG_MIN = '-9223372036854775808'
export default (buffer: GrowableBuffer, value: string): void => {
	assert.instanceOf(buffer, GrowableBuffer)
	assert.instanceOf(value, String)
	assert(!(strint.gt(value, LONG_MAX) || strint.lt(value, LONG_MIN)), 'Value out of range')
	const upper = strint.div(value, strint.LONG_UPPER_SHIFT, true) //get upper signed int
	const lower = strint.sub(value, strint.mul(upper, strint.LONG_UPPER_SHIFT)) //get lower unsigned int
	const byteBuffer = new ArrayBuffer(8)
	const dataView = new DataView(byteBuffer)
	dataView.setInt32(0, Number(upper))
	dataView.setUint32(4, Number(lower))
	buffer.addAll(byteBuffer)
}