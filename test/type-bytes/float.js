let type = new t.FloatType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x20]));
assert.instanceOf(r.readType(buffer), t.FloatType);