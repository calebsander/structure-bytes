import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.SetType(
		new t.StructType({
			a: new t.UnsignedShortType,
			b: new t.CharType
		})
	)
	const gb = new GrowableBuffer
	for (const [invalidValue, message] of [
		[undefined, 'undefined is not an instance of Set'],
		[[2, true], '[2, true] is not an instance of Set'],
		['abc', '"abc" is not an instance of Set'],
		[{a: 'b'}, '{a: "b"} is not an instance of Set'],
		[new Set([1]), '1 is not an instance of Object']
	] as [any, string][]) {
		assert.throws(
			() => type.writeValue(gb, invalidValue),
			(err: Error) => err.message === message
		)
	}

	const gb2 = new GrowableBuffer
	type.writeValue(gb2, new Set)
	assert.deepEqual(new Uint8Array(gb2.toBuffer()), new Uint8Array([0]))
	assert.deepEqual(type.readValue(gb2.toBuffer()), new Set)

	const gb3 = new GrowableBuffer
	const VALUE = new Set([
		{a: 2, b: 'c'},
		{a: 420, b: '-'}
	])
	type.writeValue(gb3, VALUE)
	assert.deepEqual(
		new Uint8Array(gb3.toBuffer()),
		new Uint8Array([2, 0, 2, 0x63, 0x01, 0xa4, 0x2d])
	)
	assert.deepEqual(type.readValue(gb3.toBuffer()), VALUE)
}