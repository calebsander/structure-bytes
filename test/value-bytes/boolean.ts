import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.BooleanType
	const gb = new GrowableBuffer
	type.writeValue(gb, false)
	type.writeValue(gb, true)
	assert.equal(gb.toBuffer(), bufferFrom([0x00, 0xff]))
	assert.equal(type.readValue(gb.toBuffer().slice(0, 1)), false)
	assert.equal(type.readValue(gb.toBuffer().slice(1, 2)), true)

	assert.throws(
		() => type.readValue(bufferFrom([0x0e])),
		'0x0e is an invalid Boolean value'
	)
}