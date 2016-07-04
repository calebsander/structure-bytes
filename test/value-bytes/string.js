let type = new t.StringType();
let gb = new GrowableBuffer();
for (let invalidValue of [undefined, null, 2, false, ['abc']]) {
	assert.throws(() => {
		type.writeValue(gb, invalidValue);
	});
}
type.writeValue(gb, 'abç');
assert.equal(gb.toBuffer(), Buffer.from([0x61, 0x62, 0xc3, 0xa7, 0]));