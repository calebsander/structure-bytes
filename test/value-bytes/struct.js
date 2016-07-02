let type = new t.StructType({
  'b': new t.BooleanArrayType(),
  'i': new t.UnsignedIntType(),
	's': new t.StringType()
});
let gb = new GrowableBuffer();
assert.throws(() => {
	type.writeValue(gb, {});
});
type.writeValue(gb, {
	b: [true, false, true],
	i: 675,
	s: 'àßçðê'
});
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0, 0, 3, 0b10100000, 0x00, 0x00, 0x02, 0xa3, 0xc3, 0xa0, 0xc3, 0x9f, 0xc3, 0xa7, 0xc3, 0xb0, 0xc3, 0xaa, 0])));