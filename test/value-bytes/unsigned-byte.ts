import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.UnsignedByteType
	const gb = new GrowableBuffer
	type.writeValue(gb, 255)
	assert.equal(gb.toBuffer(), bufferFrom([255]))
	assert.equal(type.readValue(gb.toBuffer()), 255)

	assert.equal(type.valueBuffer('128'), bufferFrom([128]))
}