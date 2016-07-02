let type = new t.DoubleType();
let buffer = type.toBuffer();
assert.assert(buffer.equals(Buffer.from([0x21])));
assert.instanceOf(r.readType(buffer), t.DoubleType);