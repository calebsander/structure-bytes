import {r} from '../../dist'
import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

export = () => {
	const type = new t.UnsignedShortType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0x12]))
	assert(new t.UnsignedShortType().equals(r.type(buffer)))
}