import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.OptionalType(
		new t.SetType(new t.UnsignedLongType)
	)
	assert.deepEqual(new Uint8Array(type.toBuffer()), new Uint8Array([0x60, 0x53, 0x14]))
	assert(type.equals(r.type(type.toBuffer())))
}