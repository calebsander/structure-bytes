import {GrowableBuffer} from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert} from '../test-common'

export = () => {
	const type = new t.TupleType({
		type: new t.StringType,
		length: 5
	})
	for (const [invalidValue, message] of [
		[undefined, 'undefined is not an instance of Array'],
		[null, 'null is not an instance of Array'],
		['abcde', '"abcde" is not an instance of Array'],
		[7, '7 is not an instance of Array'],
		[true, 'true is not an instance of Array'],
		[[1, 2, 3, 4, 5], '1 is not an instance of String'],
		[['a', 'b', 'c', 'd', 5], '5 is not an instance of String'],
		[['a', 'b', 'c', 'd', 'e', 'f'], 'Length does not match: expected 5 but got 6']
	] as [any, string][]) {
		assert.throws(
			() => type.valueBuffer(invalidValue),
			(err: Error) => err.message === message
		)
	}
	const gb = new GrowableBuffer
	const VALUE = [
		'',
		'a',
		'ab',
		'abc',
		'abcd'
	]
	type.writeValue(gb, VALUE)
	assert.deepEqual(new Uint8Array(gb.toBuffer()), new Uint8Array([
		0,
		0x61, 0,
		0x61, 0x62, 0,
		0x61, 0x62, 0x63, 0,
		0x61, 0x62, 0x63, 0x64, 0
	]))
	assert.deepEqual(type.readValue(gb.toBuffer()), VALUE)
}