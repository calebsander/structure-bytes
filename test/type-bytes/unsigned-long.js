let type = new t.UnsignedLongType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x14]));
assert.instanceOf(r.readType(buffer), t.UnsignedLongType);