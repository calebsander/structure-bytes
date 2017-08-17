import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.PointerType(new t.LongType)
	assert.equal(type.toBuffer(), bufferFrom([0x70, 0x04]))
	assert.equal(r.type(type.toBuffer()), type)
}