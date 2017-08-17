import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.DoubleType
	const gb = new GrowableBuffer
	type.writeValue(gb, -Infinity)
	assert.equal(gb.toBuffer(), bufferFrom([0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
	assert.equal(r.value({buffer: gb.toBuffer(), type}), -Infinity)

	assert.equal(type.valueBuffer(String(Math.PI)), bufferFrom([0x40, 0x09, 0x21, 0xfb, 0x54, 0x44, 0x2d, 0x18]))
}