import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const array = new t.ArrayType(
		new t.UnsignedIntType
	)
	assert.deepEqual(new Uint8Array(array.toBuffer()), new Uint8Array([0x52, 0x13]))
	assert(array.equals(r.type(array.toBuffer())))
}