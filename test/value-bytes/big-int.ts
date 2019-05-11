import * as t from '../../dist'
import {assert, concat} from '../test-common'

export = () => {
	const type = new t.BigIntType
	{
		const VALUE = '-1234567890'
		const buffer = type.valueBuffer(VALUE)
		const bytes = [0xb6, 0x69, 0xfd, 0x2e]
		assert.deepEqual(new Uint8Array(buffer), concat([
			new Uint8Array([bytes.length]),
			new Uint8Array(bytes)
		]))
		assert.equal(type.readValue(buffer), VALUE)
	}
	{
		const buffer = type.valueBuffer('0')
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([0]))
		assert.equal(type.readValue(buffer), '0')
	}
	{
		const buffer = type.valueBuffer('-128')
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([1, -128 + 256]))
		assert.equal(type.readValue(buffer), '-128')
	}
	{
		const buffer = type.valueBuffer('127')
		assert.deepEqual(new Uint8Array(buffer), new Uint8Array([1, 127]))
		assert.equal(type.readValue(buffer), '127')
	}

	assert.throws(
		() => type.valueBuffer([true] as any),
		(err: Error) => err.message === '[true] is not an instance of String'
	)
	assert.throws(
		() => type.valueBuffer('120971.00'),
		(err: Error) => err.message === 'Illegal strint format: 120971.00'
	)
}