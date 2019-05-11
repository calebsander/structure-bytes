import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.LongType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x04]))
	assert(new t.LongType().equals(r.type(buffer)))
}