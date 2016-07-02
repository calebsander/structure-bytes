let type = new t.LongType();
let buffer = type.toBuffer();
assert.assert(buffer.equals(Buffer.from([0x04])));
assert.instanceOf(r.readType(buffer), t.LongType);