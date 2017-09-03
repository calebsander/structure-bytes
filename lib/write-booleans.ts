import assert from './assert'
import {dividedByEight, modEight} from './bit-math'
import GrowableBuffer from './growable-buffer'

/**
 * Writes an array of booleans for [[BooleanTupleType]]
 * or [[BooleanArrayType]].
 * The boolean at index `8 * a + b` (where `a` is an integer
 * and `b` is an integer from `0` to `7`) is in the `b`th MSB
 * (0-indexed) of the `a`th appended byte.
 * @param buffer The buffer to which to append the bytes
 * @param booleans The boolean values to write
 */
export default (buffer: GrowableBuffer, booleans: boolean[]): void => {
	assert.instanceOf(booleans, Array)
	const incompleteBytes = modEight(booleans.length) //whether the booleans take up a partial byte
	const bytes = dividedByEight(booleans.length) //floored, so need to add one if incompleteBytes
	let length: number
	if (incompleteBytes) length = bytes + 1
	else length = bytes
	const byteBuffer = new ArrayBuffer(length)
	const castBuffer = new Uint8Array(byteBuffer)
	for (let i = 0; i < booleans.length; i++) {
		const bool = booleans[i]
		assert.instanceOf(bool, Boolean)
		const bit = modEight(~modEight(i)) //7 - (i % 8)
		//Set desired bit, leaving the others unchanges
		if (bool) castBuffer[dividedByEight(i)] |= 1 << bit
	}
	buffer.addAll(byteBuffer)
}