/*eslint-disable no-undef*/
let type = new t.ShortType;
let buffer = type.toBuffer();
assert.equal(buffer, bufferFrom([0x02]));
assert.equal(r.type(buffer), new t.ShortType);