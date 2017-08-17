import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.StringType
	const buffer = type.toBuffer()
	assert.equal(buffer, bufferFrom([0x41]))
	assert.equal(r.type(buffer), new t.StringType)
}