import {r} from '../../dist'
import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

export = () => {
	const type = new t.ByteType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0x01]))
	assert(new t.ByteType().equals(r.type(buffer)))
}