let type = new t.UnsignedIntType();
let buffer = type.toBuffer();
assert.assert(buffer.equals(Buffer.from([0x13])));
assert.instanceOf(r.readType(buffer), t.UnsignedIntType);