let type = new t.BooleanArrayType;
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x32]));
assert.equal(r.type(buffer), new t.BooleanArrayType);