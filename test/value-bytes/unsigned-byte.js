/*eslint-disable no-undef*/
let type = new t.UnsignedByteType;
let gb = new GrowableBuffer;
type.writeValue(gb, 255);
assert.equal(gb.toBuffer(), bufferFrom([255]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), 255);
assert.equal(type.valueBuffer('128'), bufferFrom([128]));