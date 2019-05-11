import {r} from '../../dist'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.OctetsType
	const buffer = type.toBuffer()
	assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0x42]))
	assert(new t.OctetsType().equals(r.type(buffer)))

	assert(type.equals(r.type(new Uint8Array([0xaa, 0xbb, 0xcc, 0x42, 0xdd]).subarray(3, 4))))
	assert.throws(
		() => r.type(new Uint8Array([0xaa, 0xbb, 0xcc, 0x42, 0xdd]).subarray(3)),
		(err: Error) => err.message === 'Did not consume all of the buffer'
	)
}