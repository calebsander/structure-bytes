import assert from '../../dist/lib/assert'
import * as t from '../../dist'
import {bufferFrom, concat} from '../test-common'

export = () => {
	const type = new t.BigIntType
	{
		const VALUE = '-1234567890'
		const buffer = type.valueBuffer(VALUE)
		const bytes = [0xb6, 0x69, 0xfd, 0x2e]
		assert.equal(buffer, concat([
			bufferFrom([bytes.length]),
			bufferFrom(bytes)
		]))
		assert.equal(type.readValue(buffer), VALUE)
	}
	{
		const buffer = type.valueBuffer('0')
		assert.equal(buffer, bufferFrom([0]))
		assert.equal(type.readValue(buffer), '0')
	}
	{
		const buffer = type.valueBuffer('-128')
		assert.equal(buffer, bufferFrom([1, -128 + 256]))
		assert.equal(type.readValue(buffer), '-128')
	}
	{
		const buffer = type.valueBuffer('127')
		assert.equal(buffer, bufferFrom([1, 127]))
		assert.equal(type.readValue(buffer), '127')
	}

	assert.throws(
		() => type.valueBuffer([true] as any),
		'[true] is not an instance of String'
	)
	assert.throws(
		() => type.valueBuffer('120971.00'),
		'Illegal strint format: 120971.00'
	)
}