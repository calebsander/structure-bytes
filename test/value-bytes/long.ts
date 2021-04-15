import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.LongType
	const gb = new GrowableBuffer
	const VALUE = 9223372036854775807n
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))
	assert.equal(type.readValue(gb.toBuffer()), VALUE)

	assert.throws(
		() => type.writeValue(gb, [true] as any),
		(err: Error) => err.message === '[true] is not an instance of BigInt'
	)
	assert.throws(
		() => type.writeValue(gb, VALUE + 1n),
		(err: Error) => err.message === 'Value out of range'
	)
	assert.throws(
		() => type.writeValue(gb, -(VALUE + 2n)),
		(err: Error) => err.message === 'Value out of range'
	)
}