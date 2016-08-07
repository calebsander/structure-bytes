/*eslint-disable no-undef*/
assert.throws(
	() => new BufferStream,
	'Expected Buffer, got undefined'
);
assert.throws(
	() => new BufferStream([1, 2, 3]),
	'Expected Buffer, got Array'
);