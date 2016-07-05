let type = new t.BooleanType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x30]));
assert.equal(r.readType(buffer), new t.BooleanType());