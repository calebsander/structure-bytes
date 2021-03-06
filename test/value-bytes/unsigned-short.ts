import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.UnsignedShortType
	const gb = new GrowableBuffer
	const VALUE = 65535
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array(2).fill(0xff))
	assert.deepEqual(type.readValue(gb.toBuffer()), VALUE)

	assert.deepEqual(new Uint8Array(type.valueBuffer('1111')), new Uint8Array([0x04, 0x57]))
}