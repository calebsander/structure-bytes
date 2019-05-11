import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.PointerType(new t.LongType)
	assert.deepEqual(new Uint8Array(type.toBuffer()), new Uint8Array([0x70, 0x04]))
	assert(type.equals(r.type(type.toBuffer())))
}