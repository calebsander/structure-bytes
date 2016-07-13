let type = new t.CharType();
let gb = new GrowableBuffer();
for (let invalidValue of [undefined, 2, '', 'cd', 'é—é']) {
	assert.throws(() => {
		type.writeValue(gb, invalidValue);
	});
}
type.writeValue(gb, 'é');
assert.equal(gb.toBuffer(), Buffer.from([0xc3, 0xa9]));

const buffer = Buffer.from([0x61, 0xc3, 0xa9, 0x62]); //aéb
assert.equal(r.value({buffer, offset: 1, type}), 'é');