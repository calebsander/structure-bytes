let map = new t.MapType(
	new t.StringType(),
	new t.StructType({
		'a': new t.ArrayType(new t.UnsignedByteType()),
		'b—c': new t.CharType()
	})
);
assert.equal(map.toBuffer(), Buffer.from([0x54, 0x41, 0x51, 2, 1, 0x61, 0x52, 0x11, 5, 0x62, 0xe2, 0x80, 0x94, 0x63, 0x40]));
assert.equal(r.readType(map.toBuffer()), map);