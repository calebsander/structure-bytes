let type = new t.IntType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x03]));
assert.instanceOf(r.readType(buffer), t.IntType);