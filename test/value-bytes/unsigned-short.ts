import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFill, bufferFrom} from '../test-common'

export = () => {
	const type = new t.UnsignedShortType
	const gb = new GrowableBuffer
	const VALUE = 65535
	type.writeValue(gb, VALUE)
	assert.equal(gb.toBuffer(), bufferFill(2, 0xff))
	assert.equal(r.value({buffer: gb.toBuffer(), type}), VALUE)

	assert.equal(type.valueBuffer('1111'), bufferFrom([0x04, 0x57]))
}