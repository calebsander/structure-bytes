let type = new t.UnsignedIntType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x13]));
assert.equal(r.readType(buffer), new t.UnsignedIntType());