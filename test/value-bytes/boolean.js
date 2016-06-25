let type = new t.BooleanType();
let gb = new GrowableBuffer();
type.writeValue(gb, false);
type.writeValue(gb, true);
assert.assert(gb.toBuffer().equals(Buffer.from([0x00, 0x80])));