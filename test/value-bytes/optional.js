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
assert.equal(r.readValue({buffer: gb.toBuffer(), type}), null);
gb = new GrowableBuffer();
const VALUE = [1, 10, 100];
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0xFF, 0, 0, 0, 3, 1, 10, 100]));
assert.equal(r.readValue({buffer: gb.toBuffer(), type}), VALUE);