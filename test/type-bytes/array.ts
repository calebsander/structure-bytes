import assert from '../../dist/lib/assert'
import {r} from '../../dist'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const array = new t.ArrayType(
		new t.UnsignedIntType
	)
	assert.equal(array.toBuffer(), bufferFrom([0x52, 0x13]))
	assert.equal(r.type(array.toBuffer()), array)
}