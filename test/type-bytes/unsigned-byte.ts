import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.UnsignedByteType
	const buffer = type.toBuffer()
	assert.equal(buffer, bufferFrom([0x11]))
	assert.equal(r.type(buffer), new t.UnsignedByteType)
}