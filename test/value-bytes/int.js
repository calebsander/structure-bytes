let type = new t.IntType();
let gb = new GrowableBuffer();
type.writeValue(gb, -2147483648);
assert.assert(gb.toBuffer().equals(Buffer.from([0x80, 0x00, 0x00, 0x00])));