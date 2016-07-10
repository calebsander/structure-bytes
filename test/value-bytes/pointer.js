const octetPointers = new t.PointerType(
	new t.ArrayType(
		new t.UnsignedByteType()
	)
);
let type = new t.StructType({
	'a': octetPointers,
	'b': octetPointers
});
let gb = new GrowableBuffer();
let VALUE = {
	a: [100, 101, 102, 103, 104],
	b: [100, 101, 102, 103, 104]
};
type.writeValue(gb, VALUE);
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 5, 100, 101, 102, 103, 104]));
assert.equal(r.readValue({buffer: gb.toBuffer(), type}), VALUE);
type = new t.PointerType(new t.LongType());
gb = new GrowableBuffer();
type.writeValue(gb, '1234567890');
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0, 4, 0, 0, 0, 0, 0x49, 0x96, 0x02, 0xd2]));
assert.equal(r.readValue({buffer: gb.toBuffer(), type}), '1234567890');
type = new t.TupleType({
	type: new t.PointerType(new t.StringType()),
	length: 10
});
gb = new GrowableBuffer();
let tuple = [];
for (let i = 0; i < 10; i++) tuple[i] = '0abc0';
type.writeValue(gb, tuple);
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0x30, 0x61, 0x62, 0x63, 0x30, 0]));
assert.equal(r.readValue({buffer: gb.toBuffer(), type}), tuple);
type = new t.OptionalType(new t.PointerType(new t.UnsignedShortType()));
gb = new GrowableBuffer();
type.writeValue(gb, 123);
assert.equal(gb.toBuffer(), Buffer.from([0xFF, 0, 0, 0, 5, 0, 123]));
assert.equal(r.readValue({buffer: gb.toBuffer(), type}), 123);
type = new t.MapType(
	new t.PointerType(new t.StringType()),
	new t.PointerType(new t.ByteType())
);
gb = new GrowableBuffer();
let map = new Map().set('abc', -126).set('def', -126);
type.writeValue(gb, map);
assert.equal(gb.toBuffer(), Buffer.from([0, 0, 0, 2, 0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 25, 0, 0, 0, 24, 0x61, 0x62, 0x63, 0, -126 + 256, 0x64, 0x65, 0x66, 0]));
assert.equal(r.readValue({buffer: gb.toBuffer(), type}), map);