import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFill, bufferFrom} from '../test-common'

export = () => {
	const type = new t.UnsignedLongType
	const gb = new GrowableBuffer
	const VALUE = '18446744073709551615'
	type.writeValue(gb, VALUE)
	assert.equal(gb.toBuffer(), bufferFill(8, 0xff))
	assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)
	assert.equal(type.valueBuffer('0'), bufferFill(8, 0x00))
	assert.equal(r.value({buffer: bufferFill(8, 0x00), type}), '0')
	assert.equal(type.valueBuffer(String(Math.pow(2, 32))), bufferFrom([0, 0, 0, 1, 0, 0, 0, 0]))
	assert.equal(r.value({buffer: bufferFrom([0, 0, 0, 1, 0, 0, 0, 0]), type}), String(Math.pow(2, 32)))

	assert.throws(
		() => type.writeValue(gb, [true] as any),
		'[true] is not an instance of String'
	)
	assert.throws(
		() => type.writeValue(gb, '120971.00'),
		'Illegal strint format: 120971.00'
	)
}