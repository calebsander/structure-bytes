import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.FloatType
	const gb = new GrowableBuffer
	type.writeValue(gb, Infinity)
	assert.equal(gb.toBuffer(), bufferFrom([0x7f, 0x80, 0x00, 0x00]))
	assert.equal(type.readValue(gb.toBuffer()), Infinity)

	const buffer = type.valueBuffer(2.5)
	assert.equal(buffer, bufferFrom([0x40, 0x20, 0x00, 0x00]))
	assert.equal(type.readValue(buffer), 2.5)
	assert.equal(type.valueBuffer(String(Math.E)), bufferFrom([0x40, 0x2d, 0xf8, 0x54]))
	assert.equal(type.valueBuffer('NaN'), type.valueBuffer(NaN))
	assert.equal(type.valueBuffer('Infinity'), type.valueBuffer(Infinity))
}