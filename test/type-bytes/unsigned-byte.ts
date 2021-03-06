import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.UnsignedByteType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x11]))
	assert(new t.UnsignedByteType().equals(r.type(buffer)))
}