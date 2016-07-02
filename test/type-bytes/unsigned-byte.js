let type = new t.UnsignedByteType();
let buffer = type.toBuffer();
assert.assert(buffer.equals(Buffer.from([0x11])));
assert.instanceOf(r.readType(buffer), t.UnsignedByteType);