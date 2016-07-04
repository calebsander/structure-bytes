let type = new t.BooleanType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x30]));
assert.instanceOf(r.readType(buffer), t.BooleanType);