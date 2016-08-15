/*eslint-disable no-undef*/
let type = new t.BigIntType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x06]));
assert.equal(r.type(buffer), new t.BigIntType);