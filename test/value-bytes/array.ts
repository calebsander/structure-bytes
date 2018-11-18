import {strict as assert} from 'assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.ArrayType(
		new t.StructType({
			a: new t.UnsignedShortType as t.Type<string | number>,
			b: new t.CharType
		})
	)
	for (const [invalidValue, message] of [
		[undefined, 'undefined is not an instance of Array'],
		[[2, true], '2 is not an instance of Object'],
		['abc', '"abc" is not an instance of Array'],
		[{a: 'b'}, '{a: "b"} is not an instance of Array']
	] as [any, string][]) {
		assert.throws(
			() => type.valueBuffer(invalidValue),
			(err: Error) => err.message === message
		)
	}

	const gb = new GrowableBuffer
	const VALUE = [
		{a: 7623, b: 'a'},
		{a: '23', b: 'Ȁ'}
	]
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([2, 0x1d, 0xc7, 0x61, 0, 23, 0xc8, 0x80]))
	assert.deepEqual(type.readValue(gb.toBuffer()), VALUE.map(({a, b}) => ({a: Number(a), b})))

	const EMPTY_VALUE: {a: number, b: string}[] = []
	const emptyBuffer = type.valueBuffer(EMPTY_VALUE)
	assert.deepEqual(new Uint8Array(emptyBuffer), bufferFrom([0]))
	assert.deepEqual(type.readValue(emptyBuffer), EMPTY_VALUE)
}