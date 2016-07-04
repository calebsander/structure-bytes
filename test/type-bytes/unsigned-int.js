let type = new t.UnsignedIntType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x13]));
assert.instanceOf(r.readType(buffer), t.UnsignedIntType);