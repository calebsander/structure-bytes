let type = new t.UnsignedIntType();
let gb = new GrowableBuffer();
type.writeValue(gb, 4294967295);
assert.equal(gb.toBuffer(), Buffer.from([0xff, 0xff, 0xff, 0xff]));