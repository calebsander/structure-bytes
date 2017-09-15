import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.FlexIntType
	const TWO_6 = 2 ** 6, TWO_13 = 2 ** 13
	for (let value = 0; value < TWO_6; value++) {
		const valueBuffer = type.valueBuffer(value)
		assert.equal(valueBuffer, bufferFrom([value * 2]))
		assert.equal(r.value({type, buffer: valueBuffer}), value)
	}
	for (let value = -TWO_6; value < 0; value++) {
		const valueBuffer = type.valueBuffer(value)
		assert.equal(valueBuffer, bufferFrom([-(value * 2 + 1)]))
		assert.equal(r.value({type, buffer: valueBuffer}), value)
	}
	for (let value = TWO_6; value < TWO_6 + TWO_13; value++) {
		const relativeValue = value - TWO_6
		const valueBuffer = type.valueBuffer(value)
		assert.equal(valueBuffer, bufferFrom([
			0b10000000 | ((relativeValue * 2) >> 8),
			(relativeValue * 2) & 0xFF
		]))
		assert.equal(r.value({type, buffer: valueBuffer}), value)
	}
	for (let value = -(TWO_6 + TWO_13); value < -TWO_6; value++) {
		const relativeValue = value + TWO_6
		const valueBuffer = type.valueBuffer(value)
		assert.equal(valueBuffer, bufferFrom([
			0b10000000 | ((-(relativeValue * 2 + 1)) >> 8),
			(-(relativeValue * 2 + 1)) & 0xFF
		]))
		assert.equal(r.value({type, buffer: valueBuffer}), value)
	}

	assert.throws(
		() => type.valueBuffer(true as any),
		'true is not an instance of Number'
	)
	assert.throws(
		() => type.valueBuffer(1.2),
		'1.2 is not an integer'
	)
	type.valueBuffer(2 ** 52 - 1)
	assert.throws(
		() => type.valueBuffer(2 ** 52),
		'4503599627370496 is not in [-4503599627370496,4503599627370496)'
	)
	type.valueBuffer(-(2 ** 52))
	assert.throws(
		() => type.valueBuffer(-(2 ** 52 + 1)),
		'-4503599627370497 is not in [-4503599627370496,4503599627370496)'
	)
	assert.throws(
		() => r.value({type, buffer: bufferFrom([])}),
		'Buffer is not long enough'
	)
	assert.throws(
		() => r.value({type, buffer: bufferFrom([0b11111111])}),
		'Invalid number of bytes'
	)
	assert.throws(
		() => r.value({type, buffer: bufferFrom([0b10000001])}),
		'Buffer is not long enough'
	)
}