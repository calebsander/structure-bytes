import assert from '../../dist/lib/assert'
import * as t from '../../dist'

export = () => {
	assert.throws(
		() => t.AbstractType._value,
		'Generic Type has no value byte'
	)
	const type = new (t.AbstractType as any)
	assert.throws(
		() => type.valueBuffer(23),
		'this.writeValue is not a function'
	)
}