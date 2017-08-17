import assert from '../../dist/lib/assert'
import BufferStream from '../../dist/lib/buffer-stream'

interface AnyNewable {
	new(...args: any[]): any
}
export = () => {
	assert.throws(
		() => new (BufferStream as AnyNewable),
		'Expected ArrayBuffer or GrowableBuffer, got undefined'
	)
	assert.throws(
		() => new (BufferStream as AnyNewable)([1, 2, 3]),
		'Expected ArrayBuffer or GrowableBuffer, got Array'
	)
}