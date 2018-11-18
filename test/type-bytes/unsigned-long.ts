import {r} from '../../dist'
import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

export = () => {
	const type = new t.UnsignedLongType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0x14]))
	assert(new t.UnsignedLongType().equals(r.type(buffer)))
}