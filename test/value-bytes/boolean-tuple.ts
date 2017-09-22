import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const VALUE = [true, false, true, true, false, true, true, true, false, false, true]
	const type = new t.BooleanTupleType(VALUE.length)
	const gb = new GrowableBuffer
	type.writeValue(gb, VALUE)
	assert.equal(gb.toBuffer(), bufferFrom([0b10110111, 0b00100000]))
	assert.equal(type.readValue(gb.toBuffer()), VALUE)

	const VALUE2 = [true, false, true, false, true, false, true, false, false, true, false, true, false, true, false, true]
	const fullType = new t.BooleanTupleType(VALUE2.length)
	const buffer = fullType.valueBuffer(VALUE2)
	assert.equal(buffer, bufferFrom([0b10101010, 0b01010101]))
	assert.equal(fullType.readValue(buffer), VALUE2)

	assert.throws(
		() => fullType.valueBuffer(new Array(VALUE2.length + 1)),
		'Length does not match'
	)
}