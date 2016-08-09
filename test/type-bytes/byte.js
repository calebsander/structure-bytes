/*eslint-disable no-undef*/
let type = new t.ByteType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x01]));
assert.equal(r.type(buffer), new t.ByteType);