let type = new t.FloatType();
let gb = new GrowableBuffer();
type.writeValue(gb, Infinity);
assert.assert(gb.toBuffer().equals(Buffer.from([0x7f, 0x80, 0x00, 0x00])));