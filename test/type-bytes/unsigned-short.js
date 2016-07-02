let type = new t.UnsignedShortType();
let buffer = type.toBuffer();
assert.assert(buffer.equals(Buffer.from([0x12])));
assert.instanceOf(r.readType(buffer), t.UnsignedShortType);