let type = new t.BooleanType();
let gb = new GrowableBuffer();
type.writeValue(gb, false);
type.writeValue(gb, true);
assert.equal(gb.toBuffer(), Buffer.from([0x00, 0xFF]));