/*eslint-disable no-undef*/
let type = new t.FloatType;
let gb = new GrowableBuffer;
type.writeValue(gb, Infinity);
assert.equal(gb.toBuffer(), Buffer.from([0x7f, 0x80, 0x00, 0x00]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), Infinity);