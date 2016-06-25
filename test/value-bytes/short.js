let type = new t.ShortType();
let gb = new GrowableBuffer();
type.writeValue(gb, 32767);
assert.assert(gb.toBuffer().equals(Buffer.from([0x7f, 0xff])));