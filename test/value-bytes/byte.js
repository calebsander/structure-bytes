let type = new t.ByteType();
let gb = new GrowableBuffer();
type.writeValue(gb, -128);
assert.assert(gb.toBuffer().equals(Buffer.from([0x80])));