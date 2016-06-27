let type = new t.CharType();
let gb = new GrowableBuffer();
for (let invalidValue of [undefined, 2, '', 'cd', 'é—é']) {
	assert.throws(() => {
		type.writeValue(gb, invalidValue);
	});
}
type.writeValue(gb, 'é');
assert.assert(gb.toBuffer().equals(Buffer.from([0xc3, 0xa9])));