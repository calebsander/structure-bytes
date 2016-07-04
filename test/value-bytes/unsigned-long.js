let type = new t.UnsignedLongType();
let gb = new GrowableBuffer();
type.writeValue(gb, '18446744073709551615');
assert.equal(gb.toBuffer(), Buffer.alloc(8, 0xff));