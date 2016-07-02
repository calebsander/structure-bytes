let type = new t.ShortType();
let buffer = type.toBuffer();
assert.assert(buffer.equals(Buffer.from([0x02])));
assert.instanceOf(r.readType(buffer), t.ShortType);