import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.BooleanType
	const gb = new GrowableBuffer
	type.writeValue(gb, false)
	type.writeValue(gb, true)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([0x00, 0xff]))
	assert.equal(type.readValue(gb.toBuffer().slice(0, 1)), false)
	assert.equal(type.readValue(gb.toBuffer().slice(1, 2)), true)

	assert.throws(
		() => type.readValue(new Uint8Array([0x0e]).buffer),
		(err: Error) => err.message === '0x0e is an invalid Boolean value'
	)
}