let type = new t.DoubleType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x21]));
assert.instanceOf(r.readType(buffer), t.DoubleType);