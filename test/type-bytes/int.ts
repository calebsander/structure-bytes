import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.IntType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x03]))
	assert(new t.IntType().equals(r.type(buffer)))
}