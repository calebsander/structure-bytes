import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert, concat} from '../test-common'

export = () => {
	const type = new t.OctetsType
	const gb = new GrowableBuffer
	const VALUE = new Uint8Array([0xc1, 0xb5, 0x4c, 0x97, 0x9e, 0x9a, 0xde, 0x5b, 0x46, 0xf5, 0x1a, 0x4a, 0xbb, 0x47, 0xbd, 0x78, 0x84, 0xe7, 0x80, 0xb, 0x9, 0xa9, 0x58, 0x26, 0x8b, 0x1b, 0x64, 0xb5, 0x29, 0xf8, 0x58, 0x3a, 0x72, 0x96, 0x4a, 0x6e, 0x4e, 0x44, 0x97, 0xf0, 0xa9, 0xf6, 0xed, 0x3b, 0x91, 0x8, 0x5b, 0x65, 0x75, 0x28, 0x4d, 0x2d, 0x39, 0xa1, 0x5a, 0xc1, 0xd4, 0x28, 0xb7, 0xa9, 0x2a, 0xac, 0xcc, 0x45, 0x3d, 0x25, 0x3a, 0x5b, 0x3e, 0xfc, 0xcb, 0xd2, 0xaf, 0x62, 0x7e, 0x90, 0x7f, 0x1b, 0x52, 0xd1, 0x36, 0x8d, 0x16, 0xd2, 0xe, 0x3d, 0x1f, 0x9a, 0x4e, 0xc3, 0xd4, 0xa4, 0xac, 0x7e, 0xcd, 0xcf, 0x68, 0x8d, 0xdb, 0x7b])
	type.writeValue(gb, VALUE.buffer)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), concat([new Uint8Array([VALUE.length]), VALUE]))
	assert.deepEqual(new Uint8Array(type.readValue(gb.toBuffer())), VALUE)

	{
		const buffer = type.valueBuffer(new ArrayBuffer(0))
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0]))
		assert.deepEqual(new Uint8Array(type.readValue(buffer)), new Uint8Array)
	}

	{
		const value = new Uint8Array(8).map((_, i) => 2 ** i).subarray(3, 6)
		const buffer = type.valueBuffer(value)
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([3, 8, 16, 32]))
		assert.deepEqual(new Uint8Array(type.readValue(buffer)), value)
	}

	{
		const buffer = new Uint8Array([0xaa, 0xbb, 2, 10, 11, 0xcc, 0xdd, 0xee])
		assert.deepEqual(
			new Uint8Array(type.readValue(buffer.subarray(2, 5))),
			new Uint8Array([10, 11])
		)
		assert.deepEqual(
			new Uint8Array(type.readValue(buffer.subarray(0, 5), 2)),
			new Uint8Array([10, 11])
		)
		assert.deepEqual(
			new Uint8Array(type.readValue(buffer.subarray(1, 5), 1)),
			new Uint8Array([10, 11])
		)
		assert.throws(
			() => type.readValue(buffer.subarray(2)),
			(err: Error) => err.message === 'Did not consume all of buffer'
		)
	}

	assert.throws(
		() => type.readValue(new Uint8Array([1]).buffer),
		(err: Error) => err.message === 'Buffer is not long enough'
	)
}