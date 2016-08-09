/*eslint-disable no-undef*/
let type = new t.BooleanArrayType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x32]));
assert.equal(r.type(buffer), new t.BooleanArrayType);