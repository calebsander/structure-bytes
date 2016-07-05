let set = new t.SetType(
	new t.StructType({
		'long': new t.LongType(),
		'str': new t.StringType()
	})
);
assert.equal(set.toBuffer(), Buffer.from([0x53, 0x51, 2, 4, 0x6c, 0x6f, 0x6e, 0x67, 0x04, 3, 0x73, 0x74, 0x72, 0x41]));
assert.equal(r.readType(set.toBuffer()), set);