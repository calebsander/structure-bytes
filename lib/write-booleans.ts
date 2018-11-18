import AppendableBuffer from './appendable'
import * as assert from './assert'
import {timesEight} from './bit-math'

/**
 * Writes an array of booleans for [[BooleanTupleType]]
 * or [[BooleanArrayType]].
 * The boolean at index `8 * a + b` (where `a` is an integer
 * and `b` is an integer from `0` to `7`) is in the `b`th MSB
 * (0-indexed) of the `a`th appended byte.
 * @param buffer The buffer to which to append the bytes
 * @param booleans The boolean values to write
 */
export default (buffer: AppendableBuffer, booleans: boolean[]): void => {
	assert.instanceOf(booleans, Array)
	byteLoop: for (let byteIndex = 0;; byteIndex++) {
		let byteValue = 0
		for (let bit = 0; bit < 8; bit++) {
			const booleanIndex = timesEight(byteIndex) | bit
			if (booleanIndex === booleans.length) {
				if (bit) buffer.add(byteValue)
				break byteLoop
			}
			const bool = booleans[booleanIndex]
			assert.instanceOf(bool, Boolean)
			if (bool) byteValue |= 1 << (7 - bit) //go from most significant bit to least significant
		}
		buffer.add(byteValue)
	}
}