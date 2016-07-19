let type = new t.ChoiceType([new t.UnsignedByteType(), new t.UnsignedLongType(), new t.StringType()]);
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x56, 3, 0x11, 0x14, 0x41]));
assert.equal(r.type(buffer), type);