let type = new t.DoubleType();
let gb = new GrowableBuffer();
type.writeValue(gb, -Infinity);
assert.assert(gb.toBuffer().equals(Buffer.from([0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])));