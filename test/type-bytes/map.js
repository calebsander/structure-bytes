let map = new t.MapType(
  new t.StringType(),
  new t.StructType([
    {name: 'a', type: new t.ArrayType(new t.UnsignedByteType())},
    {name: 'b—c', type: new t.CharType()}
  ])
);
assert.assert(map.toBuffer().equals(Buffer.from([0x54, 0x41, 0x51, 2, 1, 0x61, 0x52, 0x11, 5, 0x62, 0xe2, 0x80, 0x94, 0x63, 0x40])));