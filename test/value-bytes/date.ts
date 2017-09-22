import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.DateType
	const gb = new GrowableBuffer
	const VALUE = new Date(1468516005643)
	type.writeValue(gb, VALUE)
	assert.equal(gb.toBuffer(), bufferFrom([0, 0, 0x01, 0x55, 0xea, 0x5f, 0xf7, 0x0b]))
	assert.equal(type.readValue(gb.toBuffer()).getTime(), VALUE.getTime())

	const beforeEpoch = new Date(-86400000)
	const beforeBuffer = type.valueBuffer(beforeEpoch)
	assert.equal(beforeBuffer, bufferFrom([0xff, 0xff, 0xff, 0xff, 0xfa, 0xd9, 0xa4, 0x00]))
	assert.equal(type.readValue(beforeBuffer).getTime(), beforeEpoch.getTime())
}