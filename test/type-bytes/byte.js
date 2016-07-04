let type = new t.ByteType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x01]));
assert.instanceOf(r.readType(buffer), t.ByteType);