/*eslint-disable no-undef*/
let type = new t.BooleanType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x30]));
assert.equal(r.type(buffer), new t.BooleanType);