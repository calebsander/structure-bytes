/*eslint-disable no-undef*/
let type = new t.UnsignedShortType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x12]));
assert.equal(r.type(buffer), new t.UnsignedShortType);