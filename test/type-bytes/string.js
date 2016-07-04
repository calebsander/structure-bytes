let type = new t.StringType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x41]));
assert.instanceOf(r.readType(buffer), t.StringType);