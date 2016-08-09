/*eslint-disable no-undef*/
let type = new t.UnsignedIntType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x13]));
assert.equal(r.type(buffer), new t.UnsignedIntType);