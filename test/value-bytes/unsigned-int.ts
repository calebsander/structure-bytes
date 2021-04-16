import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.UnsignedIntType
	const gb = new GrowableBuffer
	const VALUE = 4294967295
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array(4).fill(0xff))
	assert.equal(type.readValue(gb.toBuffer()), VALUE)

	assert.deepEqual(new Uint8Array(type.valueBuffer('11111111')), new Uint8Array([0, 0xa9, 0x8a, 0xc7]))
}