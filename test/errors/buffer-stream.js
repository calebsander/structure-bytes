/*eslint-disable no-undef*/
assert.throws(
	() => new BufferStream,
	'Expected ArrayBuffer or GrowableBuffer, got undefined'
)
assert.throws(
	() => new BufferStream([1, 2, 3]),
	'Expected ArrayBuffer or GrowableBuffer, got Array'
)