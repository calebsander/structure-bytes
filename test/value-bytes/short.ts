import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.ShortType
	const gb = new GrowableBuffer
	const VALUE = -32768
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([0x80, 0x00]))
	assert.equal(type.readValue(gb.toBuffer()), VALUE)

	assert.deepEqual(new Uint8Array(type.valueBuffer('256')), new Uint8Array([0x01, 0x00]))
}