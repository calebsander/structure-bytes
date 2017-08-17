import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.BooleanType
	const gb = new GrowableBuffer
	type.writeValue(gb, false)
	type.writeValue(gb, true)
	assert.equal(gb.toBuffer(), bufferFrom([0x00, 0xff]))
	assert.equal(r.value({buffer: gb.toBuffer().slice(0, 1), type}), false)
	assert.equal(r.value({buffer: gb.toBuffer().slice(1, 2), type}), true)

	assert.throws(
		() => r.value({buffer: bufferFrom([0x0e]), type}),
		'0x0e is an invalid Boolean value'
	)
}