import assert from '../../dist/lib/assert'
import AbstractType from '../../dist/types/abstract'

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
}