/*eslint-disable no-undef*/
assert.throws(
	() => r.type(bufferFrom([t.BooleanTupleType._value, 0, 0, 1])),
	'Buffer is not long enough'
);
assert.throws(
	() => r.value({buffer: new ArrayBuffer(0), type: new t.Type}),
	'Not a structure type: Type {}'
);
assert.throws(
	() => r.type(bufferFrom([0xaa])),
	'No such type: 0xaa'
);