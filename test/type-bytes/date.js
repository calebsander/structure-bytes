/*eslint-disable no-undef*/
let type = new t.DateType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x15]));
assert.equal(r.type(buffer), new t.DateType);