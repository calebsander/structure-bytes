/*eslint-disable no-undef*/
let type = new t.ChoiceType([new t.UnsignedByteType, new t.UnsignedIntType, new t.StringType]);
let gb = new GrowableBuffer;
type.writeValue(gb, 23);
assert.equal(gb.toBuffer(), Buffer.from([0, 23]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), 23);
gb = new GrowableBuffer;
type.writeValue(gb, 12345);
assert.equal(gb.toBuffer(), Buffer.from([1, 0, 0, 0x30, 0x39]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), 12345);
gb = new GrowableBuffer;
type.writeValue(gb, 'boop');
assert.equal(gb.toBuffer(), Buffer.from([2, 0x62, 0x6f, 0x6f, 0x70, 0]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), 'boop');
assert.throws(
	() => type.writeValue(gb, true),
	'No types matched: true'
);