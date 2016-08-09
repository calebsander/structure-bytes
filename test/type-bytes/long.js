/*eslint-disable no-undef*/
let type = new t.LongType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x04]));
assert.equal(r.type(buffer), new t.LongType);