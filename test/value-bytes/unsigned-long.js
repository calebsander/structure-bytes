let type = new t.UnsignedLongType();
let gb = new GrowableBuffer();
type.writeValue(gb, '18446744073709551615');
assert.assert(gb.toBuffer().equals(Buffer.alloc(8, 0xff)));