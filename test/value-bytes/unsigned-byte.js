/*eslint-disable no-undef*/
let type = new t.UnsignedByteType;
let gb = new GrowableBuffer;
type.writeValue(gb, 255);
assert.equal(gb.toBuffer(), Buffer.from([0xff]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), 255);