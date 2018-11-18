import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {assert, bufferFrom} from '../test-common'

export = () => {
	const type = new t.CharType
	const gb = new GrowableBuffer
	for (const [invalidValue, message] of [
		[undefined, 'undefined is not an instance of String'],
		[2, '2 is not an instance of String'],
		['', 'String must contain only 1 character'],
		['cd', 'String must contain only 1 character'],
		['é—é', 'String must contain only 1 character']
	] as [any, string][]) {
		assert.throws(
			() => type.writeValue(gb, invalidValue),
			(err: Error) => err.message === message
		)
	}
	type.writeValue(gb, 'é')
	assert.deepEqual(new Uint8Array(gb.toBuffer()), bufferFrom([0xc3, 0xa9]))

	const arrayType = new t.ArrayType(type)
	const {buffer} = bufferFrom([3, 0x61, 0xc3, 0xa9, 0x62]) //aéb
	assert.equal(arrayType.readValue(buffer).join(''), 'aéb')
}