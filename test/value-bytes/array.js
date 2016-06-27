let type = new t.ArrayType(new t.StructType({
	'a': new t.UnsignedShortType(),
	'b': new t.CharType()
}));
let gb = new GrowableBuffer();
for (let invalidValue of [undefined, [2, true], 'abc', {a: 'b'}]) {
	assert.throws(() => type.writeValue(gb, invalidValue));
}
gb = new GrowableBuffer();
type.writeValue(gb, [
	{a: 7623, b: 'a'},
	{a: 23, b: 'Ȁ'}
]);
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0, 0, 2, 0x1d, 0xc7, 0x61, 0, 23, 0xc8, 0x80])));