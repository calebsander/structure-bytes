import assert from '../../dist/lib/assert'
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
	]) {
		assert.throws(
			() => type.valueBuffer(invalidValue as any),
			message as string
		)
	}

	const gb = new GrowableBuffer
	const VALUE = [
		{a: 7623, b: 'a'},
		{a: '23', b: 'Ȁ'}
	]
	type.writeValue(gb, VALUE)
	assert.equal(gb.toBuffer(), bufferFrom([2, 0x1d, 0xc7, 0x61, 0, 23, 0xc8, 0x80]))
	assert.equal(type.readValue(gb.toBuffer()), VALUE.map(({a, b}) => ({a: Number(a), b})))

	const EMPTY_VALUE: {a: number, b: string}[] = []
	const emptyBuffer = type.valueBuffer(EMPTY_VALUE)
	assert.equal(emptyBuffer, bufferFrom([0]))
	assert.equal(type.readValue(emptyBuffer), EMPTY_VALUE)
}