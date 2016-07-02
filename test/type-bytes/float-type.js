let type = new t.FloatType();
let buffer = type.toBuffer();
assert.assert(buffer.equals(Buffer.from([0x20])));
assert.instanceOf(r.readType(buffer), t.FloatType);