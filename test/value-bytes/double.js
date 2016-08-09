/*eslint-disable no-undef*/
let type = new t.DoubleType;
let gb = new GrowableBuffer;
type.writeValue(gb, -Infinity);
assert.equal(gb.toBuffer(), bufferFrom([0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), -Infinity);
assert.equal(type.valueBuffer(String(Math.PI)), bufferFrom([0x40, 0x09, 0x21, 0xfb, 0x54, 0x44, 0x2d, 0x18]));