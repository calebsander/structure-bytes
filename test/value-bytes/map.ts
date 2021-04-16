import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.MapType(new t.CharType, new t.UnsignedByteType)
	for (const [invalidValue, message] of [
		[{c: 2}, '{c: 2} is not an instance of Map'],
		[undefined, 'undefined is not an instance of Map'],
		[null, 'null is not an instance of Map'],
		[new Map().set(2, 3), '2 is not an instance of String']
	] as [any, string][]) {
		assert.throws(
			() => type.valueBuffer(invalidValue),
			(err: Error) => err.message === message
		)
	}

	const map = new Map<string, number>()
	const gb = new GrowableBuffer
	type.writeValue(gb, map)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([0]))
	assert.deepEqual(type.readValue(gb.toBuffer()), new Map)

	map.set('é', 128).set('\n', 254)
	const gb2 = new GrowableBuffer
	type.writeValue(gb2, map)
	assert.deepEqual(
		new Uint8Array(gb2.toBuffer()),
		new Uint8Array([2, 0xc3, 0xa9, 128, 10, 254])
	)
	assert.deepEqual(type.readValue(gb2.toBuffer()), map)
}