import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const VALUE = [true, false, true, true, false, true, true, true, false, false, true]
	const type = new t.BooleanTupleType(VALUE.length)
	const gb = new GrowableBuffer
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([0b10110111, 0b00100000]))
	assert.deepEqual(type.readValue(gb.toBuffer()), VALUE)

	const VALUE2 = [true, false, true, false, true, false, true, false, false, true, false, true, false, true, false, true]
	const fullType = new t.BooleanTupleType(VALUE2.length)
	const buffer = fullType.valueBuffer(VALUE2)
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0b10101010, 0b01010101]))
	assert.deepEqual(fullType.readValue(buffer), VALUE2)

	assert.throws(
		() => fullType.valueBuffer(new Array(VALUE2.length + 1)),
		(err: Error) => err.message === 'Length does not match: expected 16 but got 17'
	)
}