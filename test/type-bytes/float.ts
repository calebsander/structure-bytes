import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.FloatType
	const buffer = type.toBuffer()
	assert.equal(buffer, bufferFrom([0x20]))
	assert.equal(r.type(buffer), new t.FloatType)
}