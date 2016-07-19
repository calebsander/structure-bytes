let type = new t.UnsignedLongType;
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x14]));
assert.equal(r.type(buffer), new t.UnsignedLongType);