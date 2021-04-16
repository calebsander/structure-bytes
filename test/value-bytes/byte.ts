import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.ByteType
	const gb = new GrowableBuffer
	type.writeValue(gb, -128)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([-128 + 0x100]))
	assert.equal(type.readValue(gb.toBuffer()), -128)

	assert.deepEqual(new Uint8Array(type.valueBuffer('1')), new Uint8Array([1]))
	assert.equal(type.readValue(new Uint8Array([1]).buffer), 1)

	assert.throws(
		() => type.writeValue(gb, true as any),
		(err: Error) => err.message === 'true is not an instance of Number'
	)
	assert.throws(
		() => type.writeValue(gb, ''),
		(err: Error) => err.message === '"" is not an instance of Number'
	)
	assert.throws(
		() => type.writeValue(gb, '129'),
		(err: Error) => err.message === 'Value out of range (129 is not in [-128,128))'
	)
	assert.throws(
		() => type.writeValue(gb, '3.14'),
		(err: Error) => err.message === '3.14 is not an integer'
	)
	assert.throws(
		() => type.writeValue(gb, null as any),
		(err: Error) => err.message === 'null is not an instance of Number'
	)
}