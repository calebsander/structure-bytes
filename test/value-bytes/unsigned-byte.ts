import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

export = () => {
	const type = new t.UnsignedByteType
	const gb = new GrowableBuffer
	type.writeValue(gb, 255)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([255]))
	assert.equal(type.readValue(gb.toBuffer()), 255)

	assert.deepEqual(new Uint8Array(type.valueBuffer('128')), bufferFrom([128]))
}