let type = new t.UnsignedByteType();
let gb = new GrowableBuffer();
type.writeValue(gb, 255);
assert.assert(gb.toBuffer().equals(Buffer.from([0xff])));