let type = new t.SetType(new t.StructType({
	'a': new t.UnsignedShortType(),
	'b': new t.CharType()
}));
let gb = new GrowableBuffer();
for (let invalidValue of [undefined, [2, true], 'abc', {a: 'b'}, new Set([1])]) {
	assert.throws(() => type.writeValue(gb, invalidValue));
}
gb = new GrowableBuffer();
type.writeValue(gb, new Set());
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0, 0]));