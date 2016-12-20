/*eslint-disable no-undef*/
assert.throws(
	() => r.type(bufferFrom([t.TupleType._value, t.ByteType._value])),
	'Buffer is not long enough'
)
assert.throws(
	() => r.value({buffer: new ArrayBuffer(0), type: new t.Type}),
	'Not a structure type: Type {}'
)
assert.throws(
	() => r.type(bufferFrom([0xaa])),
	'No such type: 0xaa'
)