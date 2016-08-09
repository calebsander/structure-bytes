/*eslint-disable no-undef*/
let type = new t.UnsignedByteType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x11]));
assert.equal(r.type(buffer), new t.UnsignedByteType);