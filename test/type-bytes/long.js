let type = new t.LongType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x04]));
assert.instanceOf(r.readType(buffer), t.LongType);