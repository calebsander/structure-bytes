let type = new t.DoubleType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x21]));
assert.equal(r.readType(buffer), new t.DoubleType());