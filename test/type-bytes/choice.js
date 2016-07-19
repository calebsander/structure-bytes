let type = new t.ChoiceType(new Set([new t.UnsignedByteType(), new t.UnsignedLongType(), new t.StringType()]));
assert.equal(type.toBuffer(), Buffer.from([0x56, 3, 0x11, 0x14, 0x41]));