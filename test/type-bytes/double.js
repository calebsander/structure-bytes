/*eslint-disable no-undef*/
let type = new t.DoubleType;
let buffer = type.toBuffer();
assert.equal(buffer, Buffer.from([0x21]));
assert.equal(r.type(buffer), new t.DoubleType);