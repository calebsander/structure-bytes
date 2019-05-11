import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.BigUnsignedIntType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x15]))
	assert(new t.BigUnsignedIntType().equals(r.type(buffer)))
}