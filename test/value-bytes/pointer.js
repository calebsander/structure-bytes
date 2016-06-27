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
type.writeValue(gb, {
  a: [100, 101, 102, 103, 104],
  b: [100, 101, 102, 103, 104]
});
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 5, 100, 101, 102, 103, 104])));
type = new t.PointerType(new t.LongType());
gb = new GrowableBuffer();
type.writeValue(gb, '1234567890');
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0, 0, 4, 0, 0, 0, 0, 0x49, 0x96, 0x02, 0xd2])));
type = new t.TupleType(new t.PointerType(new t.StringType()), 10);
gb = new GrowableBuffer();
let tuple = [];
for (let i = 0; i < 10; i++) tuple[i] = '0abc0';
type.writeValue(gb, tuple);
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 40, 0, 0, 0, 5, 0x30, 0x61, 0x62, 0x63, 0x30])));
type = new t.OptionalType(new t.PointerType(new t.UnsignedShortType()));
gb = new GrowableBuffer();
type.writeValue(gb, 123);
assert.assert(gb.toBuffer().equals(Buffer.from([0xFF, 0, 0, 0, 5, 0, 123])));
type = new t.MapType(
  new t.PointerType(new t.StringType()),
  new t.PointerType(new t.ByteType())
);
gb = new GrowableBuffer();
let map = new Map();
map.set('abc', -126).set('def', -126);
type.writeValue(gb, map);
assert.assert(gb.toBuffer().equals(Buffer.from([0, 0, 0, 2, 0, 0, 0, 20, 0, 0, 0, 27, 0, 0, 0, 28, 0, 0, 0, 27, 0, 0, 0, 3, 0x61, 0x62, 0x63, -126 + 256, 0, 0, 0, 3, 0x64, 0x65, 0x66])));