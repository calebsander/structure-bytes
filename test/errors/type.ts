import * as t from '../../dist/types'
import AbstractType from '../../dist/types/abstract'
import {assert} from '../test-common'

interface Types {
	[typeName: string]: typeof AbstractType
}
const tTypes = t as any as Types
export = () => {
	assert.throws(
		() => AbstractType._value,
		(err: Error) => err.message === 'Generic Type has no value byte'
	)
	const type = new (AbstractType as any)
	assert.throws(
		() => type.valueBuffer(23),
		(err: Error) => err.message === 'this.writeValue is not a function'
	)
	for (const typeName in tTypes) {
		const typeConstructor = tTypes[typeName]
		assert.throws( //make sure it warns about invalid buffer before invalid value
			() => typeConstructor.prototype.writeValue('abc' as any, Symbol('def')),
			(err: Error) => err.message === '"abc" is not an instance of AppendableBuffer'
		)
	}
	assert.throws(
		() => new t.ByteType().readValue(new Uint8Array([1, 2]).buffer),
		(err: Error) => err.message === 'Did not consume all of buffer'
	)
	new t.ByteType().readValue(new Uint8Array([1, 2]).buffer, 1)
}