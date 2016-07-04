let type = new t.ShortType();
let gb = new GrowableBuffer();
type.writeValue(gb, 32767);
assert.equal(gb.toBuffer(), Buffer.from([0x7f, 0xff]));