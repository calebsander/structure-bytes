let type = new t.UnsignedShortType();
let gb = new GrowableBuffer();
type.writeValue(gb, 65535);
assert.equal(gb.toBuffer(), Buffer.from([0xff, 0xff]));