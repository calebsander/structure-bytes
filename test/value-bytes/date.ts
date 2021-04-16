import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.DateType
	const gb = new GrowableBuffer
	const VALUE = new Date(1468516005643)
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([0, 0, 0x01, 0x55, 0xea, 0x5f, 0xf7, 0x0b]))
	assert.deepEqual(type.readValue(gb.toBuffer()), VALUE)

	const beforeEpoch = new Date(-86400000)
	const beforeBuffer = type.valueBuffer(beforeEpoch)
	assert.deepEqual(new Uint8Array(beforeBuffer), new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xfa, 0xd9, 0xa4, 0x00]))
	assert.deepEqual(type.readValue(beforeBuffer), beforeEpoch)
}