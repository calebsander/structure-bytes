import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.FlexUnsignedIntType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x17]))
	assert(new t.FlexUnsignedIntType().equals(r.type(buffer)))
}