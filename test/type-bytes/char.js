let type = new t.CharType();
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x40]));
assert.instanceOf(r.readType(buffer), t.CharType);