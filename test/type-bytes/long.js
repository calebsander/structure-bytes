let type = new t.LongType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x04]));
assert.equal(r.readType(buffer), new t.LongType());