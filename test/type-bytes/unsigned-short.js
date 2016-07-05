let type = new t.UnsignedShortType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x12]));
assert.equal(r.readType(buffer), new t.UnsignedShortType());