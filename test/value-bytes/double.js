let type = new t.DoubleType();
let gb = new GrowableBuffer();
type.writeValue(gb, -Infinity);
assert.equal(gb.toBuffer(), Buffer.from([0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
assert.equal(r.value({buffer: gb.toBuffer(), type}), -Infinity);