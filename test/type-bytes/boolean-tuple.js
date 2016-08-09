/*eslint-disable no-undef*/
let type = new t.BooleanTupleType(1200);
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x31, 0, 0, 0x04, 0xb0]));
let readType = r.type(buffer);
assert.equal(readType, type);