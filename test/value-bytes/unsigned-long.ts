import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.UnsignedLongType
	const gb = new GrowableBuffer
	const VALUE = 18446744073709551615n
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array(8).fill(0xff))
	assert.deepEqual(type.readValue(gb.toBuffer()), VALUE)
	assert.deepEqual(new Uint8Array(type.valueBuffer(0n)), new Uint8Array(8).fill(0x00))
	assert.equal(type.readValue(new Uint8Array(8).fill(0x00).buffer), 0n)
	assert.deepEqual(new Uint8Array(type.valueBuffer(2n ** 32n)), new Uint8Array([0, 0, 0, 1, 0, 0, 0, 0]))
	assert.equal(type.readValue(new Uint8Array([0, 0, 0, 1, 0, 0, 0, 0]).buffer), 2n ** 32n)

	assert.throws(
		() => type.writeValue(gb, [true] as any),
		(err: Error) => err.message === '[true] is not an instance of BigInt'
	)
	assert.throws(
		() => type.writeValue(gb, VALUE + 1n),
		(err: Error) => err.message === 'Value out of range'
	)
	assert.throws(
		() => type.writeValue(gb, -1n),
		(err: Error) => err.message === 'Value out of range'
	)
}