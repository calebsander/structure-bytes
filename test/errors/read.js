/*eslint-disable no-undef*/
assert.throws(
	() => r.type(Buffer.from([t.BooleanTupleType._value, 0, 0, 1])),
	'Buffer is not long enough'
);
assert.throws(
	() => r.value({buffer: Buffer.from([]), type: new t.Type}),
	'Not a structure type: Type {}'
);