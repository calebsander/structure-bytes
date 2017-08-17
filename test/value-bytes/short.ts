import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.ShortType
	const gb = new GrowableBuffer
	const VALUE = -32768
	type.writeValue(gb, VALUE)
	assert.equal(gb.toBuffer(), bufferFrom([0x80, 0x00]))
	assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)

	assert.equal(type.valueBuffer('256'), bufferFrom([0x01, 0x00]))
}