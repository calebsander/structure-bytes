let type = new t.UnsignedLongType();
let buffer = type.toBuffer();
assert.assert(buffer.equals(Buffer.from([0x14])));
assert.instanceOf(r.readType(buffer), t.UnsignedLongType);