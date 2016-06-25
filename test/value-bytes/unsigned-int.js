let type = new t.UnsignedIntType();
let gb = new GrowableBuffer();
type.writeValue(gb, 4294967295);
assert.assert(gb.toBuffer().equals(Buffer.from([0xff, 0xff, 0xff, 0xff])));