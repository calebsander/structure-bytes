import assert from '../../dist/lib/assert'
import * as t from '../../dist/types'
import AbstractType from '../../dist/types/abstract'
import {bufferFrom} from '../test-common'

interface Types {
	[typeName: string]: typeof AbstractType
}
const tTypes = t as any as Types
export = () => {
	assert.throws(
		() => AbstractType._value,
		'Generic Type has no value byte'
	)
	const type = new (AbstractType as any)
	assert.throws(
		() => type.valueBuffer(23),
		'this.writeValue is not a function'
	)
	for (const typeName in tTypes) {
		const typeConstructor = tTypes[typeName]
		assert.throws( //make sure it warns about invalid buffer before invalid value
			() => typeConstructor.prototype.writeValue('abc' as any, Symbol('def')),
			'"abc" is not an instance of AppendableBuffer'
		)
	}
	assert.throws(
		() => new t.ByteType().readValue(bufferFrom([1, 2])),
		'Did not consume all of buffer'
	)
	new t.ByteType().readValue(bufferFrom([1, 2]), 1)
}