let type = new t.IntType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x03]));
assert.equal(r.readType(buffer), new t.IntType());