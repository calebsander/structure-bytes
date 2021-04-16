import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.DoubleType
	const gb = new GrowableBuffer
	type.writeValue(gb, '-Infinity')
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
	assert.equal(type.readValue(gb.toBuffer()), -Infinity)

	const buffer = type.valueBuffer(2.5)
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x40, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))
	assert.equal(type.readValue(buffer), 2.5)
	assert.deepEqual(new Uint8Array(type.valueBuffer(String(Math.PI))), new Uint8Array([0x40, 0x09, 0x21, 0xfb, 0x54, 0x44, 0x2d, 0x18]))
}