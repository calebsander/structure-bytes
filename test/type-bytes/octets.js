/*eslint-disable no-undef*/
let type = new t.OctetsType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x42]));
assert.equal(r.type(buffer), new t.OctetsType);