import {r} from '../../dist'
import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

export = () => {
	const type = new t.DateType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), bufferFrom([0x1a]))
	assert(new t.DateType().equals(r.type(buffer)))
}