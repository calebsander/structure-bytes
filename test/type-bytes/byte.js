let type = new t.ByteType();
let buffer = type.toBuffer();
assert.assert(buffer.equals(Buffer.from([0x01])));
assert.instanceOf(r.readType(buffer), t.ByteType);