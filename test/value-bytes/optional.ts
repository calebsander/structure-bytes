import assert from '../../dist/lib/assert'
import GrowableBuffer from '../../dist/lib/growable-buffer'
import * as t from '../../dist'
import {bufferFrom} from '../test-common'

export = () => {
	const type = new t.OptionalType(
		new t.ArrayType(
			new t.UnsignedByteType
		)
	)
	for (const [invalidValue, message] of [
		[2, '2 is not an instance of Array'],
		[[-1], 'Value out of range (-1 is not in [0,256))'],
		['abc', '"abc" is not an instance of Array']
	]) {
		assert.throws(
			() => type.valueBuffer(invalidValue as any),
			message as string
		)
	}

	assert.equal(type.valueBuffer(null), bufferFrom([0]))
	assert.equal(type.readValue(type.valueBuffer(null)), null)

	assert.equal(type.valueBuffer(undefined), bufferFrom([0]))
	assert.equal(type.readValue(type.valueBuffer(undefined)), null)

	const gb = new GrowableBuffer
	const VALUE = [1, 10, 100]
	type.writeValue(gb, VALUE)
	assert.equal(gb.toBuffer(), bufferFrom([0xFF, 3, 1, 10, 100]))
	assert.equal(type.readValue(gb.toBuffer()), VALUE)
}