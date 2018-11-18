import {strict as assert} from 'assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.FloatType
	const gb = new GrowableBuffer
	type.writeValue(gb, Infinity)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([0x7f, 0x80, 0x00, 0x00]))
	assert.equal(type.readValue(gb.toBuffer()), Infinity)

	const buffer = type.valueBuffer(2.5)
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0x40, 0x20, 0x00, 0x00]))
	assert.equal(type.readValue(buffer), 2.5)
	assert.deepEqual(new Uint8Array(type.valueBuffer(String(Math.E))), bufferFrom([0x40, 0x2d, 0xf8, 0x54]))
	assert.deepEqual(new Uint8Array(type.valueBuffer('NaN')), new Uint8Array(type.valueBuffer(NaN)))
	assert.deepEqual(new Uint8Array(type.valueBuffer('Infinity')), new Uint8Array(type.valueBuffer(Infinity)))
}