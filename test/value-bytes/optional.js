let type = new t.OptionalType(
	new t.ArrayType(
		new t.UnsignedByteType()
	)
);
let gb = new GrowableBuffer();
for (let invalidValue of [undefined, 2, [-1], 'abc']) {
	assert.throws(() => type.writeValue(gb, invalidValue));
}
gb = new GrowableBuffer();
type.writeValue(gb, null);
assert.equal(gb.toBuffer(), Buffer.from([0x00]));
gb = new GrowableBuffer();
type.writeValue(gb, [1, 10, 100]);
assert.equal(gb.toBuffer(), Buffer.from([0xFF, 0, 0, 0, 3, 1, 10, 100]));