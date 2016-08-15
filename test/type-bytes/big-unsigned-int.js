/*eslint-disable no-undef*/
let type = new t.BigUnsignedIntType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x16]));
assert.equal(r.type(buffer), new t.BigUnsignedIntType);