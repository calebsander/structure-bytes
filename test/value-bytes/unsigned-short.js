let type = new t.UnsignedShortType();
let gb = new GrowableBuffer();
type.writeValue(gb, 65535);
assert.assert(gb.toBuffer().equals(Buffer.from([0xff, 0xff])));